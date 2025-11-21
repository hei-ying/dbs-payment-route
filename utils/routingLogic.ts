import { RoutingInputs, RouteType, DBS_HK_SWIFT, LogicStepResult, RoutingResult, PaymentMethod, Currency, Country } from '../types';

const equalsIgnoreCase = (a: any, b: any) => String(a || '').toLowerCase() === String(b || '').toLowerCase();

export const calculateRoute = (inputs: RoutingInputs): RoutingResult => {
  const steps: LogicStepResult[] = [];
  
  const { paymentMethod, destinationCountry, currency, beneficiarySwift, amount, isPOBO } = inputs;

  // --- Helpers ---
  const isHKG = equalsIgnoreCase(destinationCountry, Country.HKG);
  const isDBS = equalsIgnoreCase(beneficiarySwift, DBS_HK_SWIFT);
  
  // Safe string check without optional chaining on methods
  const swiftStr = (beneficiarySwift || '').toString();
  const hasSwift = swiftStr.trim().length > 0;
  
  const isMethodSwift = equalsIgnoreCase(paymentMethod, PaymentMethod.SWIFT);
  const isMethodLocal = equalsIgnoreCase(paymentMethod, PaymentMethod.LOCAL);
  const isMethodBlank = !paymentMethod; // Checks for empty string or undefined
  
  const cur = currency as Currency;
  const isCurHKD = cur === Currency.HKD;
  const isCurCNH = cur === Currency.CNH;
  const isCurUSD = cur === Currency.USD;
  const isCurEUR = cur === Currency.EUR;
  
  const validCurrencies = [Currency.HKD, Currency.CNH, Currency.USD, Currency.EUR];
  const isValidCurrency = validCurrencies.includes(cur);

  // --- Step 1: Scope & POBO Check ---
  // Logic: if (StringUtils.equalsAny("支付方式", "LOCAL", "SWIFT") || blank || (POBO checks...))
  
  // POBO Eligibility: "启用POBO" && StringUtils.isNotEmpty("收款行SWIFT CODE") && StringUtils.equals("到账国家", "HKG") && StringUtils.equalsAnyIgnoreCase("到账币种", "HKD", "USD", "EUR", "CNH")
  const isPoboEligible = isPOBO && hasSwift && isHKG && isValidCurrency;

  // Main Scope Check
  const inScope = isMethodLocal || isMethodSwift || isMethodBlank || isPoboEligible;

  steps.push({
    stepName: "1. 预检查 (Scope Check)",
    isMatch: inScope,
    reason: inScope ? "交易在路由范围内" : "交易超出范围，默认走 TT",
    criterias: [
      { label: "支付方式为 LOCAL, SWIFT 或 空", met: isMethodLocal || isMethodSwift || isMethodBlank },
      { label: "或 满足 POBO 条件 (HKG + 有效币种 + 有SWIFT)", met: isPoboEligible }
    ]
  });

  if (!inScope) {
    return { route: RouteType.TT, steps };
  }

  // --- Step 2: FPS Logic ---
  // Logic: if (!SWIFT && HKG && !DBS && (HKD || (CNH && <= 5M)) && !POBO)
  // Note: !SWIFT implies LOCAL or BLANK in this context
  const fpsCriteria = [
    { label: "支付方式 ≠ SWIFT", met: !isMethodSwift },
    { label: "到账国家 = HKG", met: isHKG },
    { label: "收款行 ≠ DBS HK (非同行)", met: !isDBS },
    { label: "未启用 POBO", met: !isPOBO },
    { label: "币种 HKD 或 (CNH 且 金额 ≤ 500万)", met: isCurHKD || (isCurCNH && amount <= 5000000) }
  ];
  
  const isFPS = fpsCriteria.every(c => c.met);
  
  steps.push({
    stepName: "2. FPS (转数快)",
    isMatch: isFPS,
    reason: isFPS ? "符合 FPS 路由条件" : "不符合 FPS 条件",
    criterias: fpsCriteria
  });

  if (isFPS) return { route: RouteType.FPS, steps };

  // --- Step 3: ACT Logic ---
  // Logic: if (HKG && DBS && !POBO)
  const actCriteria = [
    { label: "到账国家 = HKG", met: isHKG },
    { label: "收款行 = DBS HK (同行)", met: isDBS },
    { label: "未启用 POBO", met: !isPOBO }
  ];

  const isACT = actCriteria.every(c => c.met);

  steps.push({
    stepName: "3. ACT (行内转账)",
    isMatch: isACT,
    reason: isACT ? "符合 ACT 行内转账条件" : "不符合 ACT 条件",
    criterias: actCriteria
  });

  if (isACT) return { route: RouteType.ACT, steps };

  // --- Step 4: RTGS Logic ---
  /*
   Condition 1 (Normal): 
     HKG && !DBS && 
     (
       (SWIFT && (USD, CNH, HKD, EUR)) 
       OR 
       (!SWIFT && ((USD, EUR) || (CNH > 5M)))
     )
   
   Condition 2 (POBO):
     POBO Eligible (Already calculated above)
  */
  
  const rtgsBase = isHKG && !isDBS;
  const rtgsSwiftBranch = isMethodSwift && isValidCurrency;
  // Note for Non-Swift Branch: HKD is missing here because Non-Swift HKD is captured by FPS above.
  const rtgsNonSwiftBranch = !isMethodSwift && (isCurUSD || isCurEUR || (isCurCNH && amount > 5000000));
  
  const matchesNormalRTGS = rtgsBase && (rtgsSwiftBranch || rtgsNonSwiftBranch);

  const rtgsCriteria = [
    { 
      label: "常规: HKG + 非DBS + [SWIFT且有效币种 或 非SWIFT且(USD/EUR/大额CNH)]", 
      met: !!matchesNormalRTGS 
    },
    { 
      label: "或 POBO: 启用且符合POBO条件", 
      met: !!isPoboEligible 
    }
  ];

  const isRTGS = matchesNormalRTGS || isPoboEligible;

  steps.push({
    stepName: "4. RTGS (CHATS)",
    isMatch: isRTGS,
    reason: isRTGS ? "符合 RTGS 路由条件" : "不符合 RTGS 条件",
    criterias: rtgsCriteria
  });

  if (isRTGS) return { route: RouteType.RTGS, steps };

  // --- Step 5: Fallback to TT ---
  steps.push({
    stepName: "5. TT (电汇)",
    isMatch: true,
    reason: "无其他本地路由匹配，默认走 TT",
    criterias: [{ label: "默认兜底路由", met: true }]
  });

  return { route: RouteType.TT, steps };
};