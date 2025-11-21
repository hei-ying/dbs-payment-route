export enum PaymentMethod {
  LOCAL = 'LOCAL',
  SWIFT = 'SWIFT',
  UNSPECIFIED = ''
}

export enum Currency {
  HKD = 'HKD',
  CNH = 'CNH',
  USD = 'USD',
  EUR = 'EUR',
  OTHER = 'OTHER'
}

export enum Country {
  HKG = 'HKG',
  OTHER = 'OTHER'
}

export enum RouteType {
  FPS = 'FPS',
  ACT = 'ACT',
  RTGS = 'RTGS',
  TT = 'TT'
}

export const DBS_HK_SWIFT = 'DHBKHKHHXXX';

export interface RoutingInputs {
  paymentMethod: PaymentMethod | string;
  destinationCountry: string; // Allow free text but UI will have presets
  currency: Currency | string;
  beneficiarySwift: string;
  amount: number;
  isPOBO: boolean;
}

export interface LogicStepResult {
  stepName: string;
  isMatch: boolean;
  reason: string;
  criterias: {
    label: string;
    met: boolean;
  }[];
}

export interface RoutingResult {
  route: RouteType;
  steps: LogicStepResult[];
}