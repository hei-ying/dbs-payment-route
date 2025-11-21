import React from 'react';
import { RoutingInputs, PaymentMethod, Currency, Country, DBS_HK_SWIFT } from '../types';
import { Settings, RotateCcw, Check, Info } from 'lucide-react';

interface Props {
  inputs: RoutingInputs;
  onChange: (newInputs: RoutingInputs) => void;
}

export const InputPanel: React.FC<Props> = ({ inputs, onChange }) => {
  const handleChange = (field: keyof RoutingInputs, value: any) => {
    onChange({ ...inputs, [field]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-slate-800 border-b pb-4">
        <Settings className="w-5 h-5 text-blue-600" />
        <h2 className="font-bold text-lg">参数配置 (Parameters)</h2>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Payment Method */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">支付方式 (Payment Method)</label>
          <div className="grid grid-cols-3 gap-2">
             {[
               { val: PaymentMethod.LOCAL, label: "LOCAL" }, 
               { val: PaymentMethod.SWIFT, label: "SWIFT" }, 
               { val: PaymentMethod.UNSPECIFIED, label: "未指定" }
             ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => handleChange('paymentMethod', opt.val)}
                  className={`p-2.5 text-sm rounded-lg border transition-all font-medium ${inputs.paymentMethod === opt.val 
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-200' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {opt.label}
                </button>
             ))}
          </div>
        </div>

        {/* Destination Country */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">到账国家 (Country)</label>
          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={() => handleChange('destinationCountry', Country.HKG)}
                className={`flex items-center justify-center gap-2 p-3 text-sm rounded-lg border transition-all font-medium ${inputs.destinationCountry === Country.HKG ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'}`}
             >
               <span className="text-lg">🇭🇰</span> HKG (香港)
             </button>
             <button 
                onClick={() => handleChange('destinationCountry', Country.OTHER)}
                className={`flex items-center justify-center gap-2 p-3 text-sm rounded-lg border transition-all font-medium ${inputs.destinationCountry === Country.OTHER ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'}`}
             >
               <span className="text-lg">🌍</span> 其他 (Other)
             </button>
          </div>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">到账币种 (Currency)</label>
          <div className="relative">
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium appearance-none cursor-pointer text-gray-700"
              value={inputs.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
            >
              <option value={Currency.HKD}>HKD - 港币</option>
              <option value={Currency.CNH}>CNH - 离岸人民币</option>
              <option value={Currency.USD}>USD - 美元</option>
              <option value={Currency.EUR}>EUR - 欧元</option>
              <option value={Currency.OTHER}>Other - 其他币种</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Amount (Conditional Visuals) */}
        <div className={`space-y-2 transition-all duration-300 ${inputs.currency === Currency.CNH ? 'bg-red-50/50 p-3 rounded-lg border border-red-100' : ''}`}>
          <div className="flex justify-between items-center">
            <label className={`text-xs font-bold uppercase tracking-wider ${inputs.currency === Currency.CNH ? 'text-red-600' : 'text-gray-500'}`}>
              到账金额 (Amount)
            </label>
            {inputs.currency === Currency.CNH && (
              <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bold">
                 CNH 关键要素
              </span>
            )}
          </div>
          
          <div className="relative">
            <input 
              type="number" 
              className={`w-full p-3 border rounded-lg focus:ring-2 outline-none text-sm font-mono ${inputs.currency === Currency.CNH ? 'border-red-200 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50 border-gray-200 focus:ring-blue-500'}`}
              value={inputs.amount}
              onChange={(e) => handleChange('amount', Number(e.target.value))}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
              {inputs.currency}
            </div>
          </div>
          
          {inputs.currency === Currency.CNH && (
             <div className="flex items-center gap-1 text-[11px] text-red-500 font-medium pl-1">
                <Info className="w-3 h-3" />
                FPS/RTGS 分界线: 5,000,000
             </div>
          )}
        </div>

        {/* Beneficiary Bank */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">收款行 SWIFT (Beneficiary)</label>
          <div className="flex flex-col gap-2">
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono uppercase placeholder-gray-400"
              value={inputs.beneficiarySwift}
              onChange={(e) => handleChange('beneficiarySwift', e.target.value)}
              placeholder="输入 SWIFT Code"
            />
            <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleChange('beneficiarySwift', DBS_HK_SWIFT)}
                  className={`py-1.5 px-2 text-xs rounded border transition-colors flex items-center justify-center gap-1
                    ${inputs.beneficiarySwift === DBS_HK_SWIFT 
                      ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold' 
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  {inputs.beneficiarySwift === DBS_HK_SWIFT && <Check className="w-3 h-3"/>} DBS (同行)
                </button>
                <button 
                  onClick={() => handleChange('beneficiarySwift', 'HSBCHKHHAXXX')}
                  className={`py-1.5 px-2 text-xs rounded border transition-colors flex items-center justify-center gap-1
                    ${inputs.beneficiarySwift !== DBS_HK_SWIFT && inputs.beneficiarySwift !== ''
                      ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' 
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  {(inputs.beneficiarySwift !== DBS_HK_SWIFT && inputs.beneficiarySwift !== '') && <Check className="w-3 h-3"/>} HSBC (非同行)
                </button>
            </div>
          </div>
        </div>

        {/* POBO Toggle */}
        <div 
             className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${inputs.isPOBO ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}
             onClick={() => handleChange('isPOBO', !inputs.isPOBO)}>
          <div className="flex flex-col">
            <span className={`text-sm font-bold ${inputs.isPOBO ? 'text-indigo-700' : 'text-gray-700'}`}>启用 POBO (代付)</span>
            <span className="text-[10px] text-gray-400">Payment On Behalf Of</span>
          </div>
          <div 
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${inputs.isPOBO ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${inputs.isPOBO ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </div>

        <button 
           onClick={() => {
             onChange({
               paymentMethod: PaymentMethod.LOCAL,
               destinationCountry: Country.HKG,
               currency: Currency.HKD,
               beneficiarySwift: 'HSBCHKHHAXXX',
               amount: 10000,
               isPOBO: false
             })
           }}
           className="flex items-center justify-center w-full p-3 mt-4 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-dashed border-gray-300 hover:border-gray-400"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> 重置为默认 (Reset)
        </button>

      </div>
    </div>
  );
};