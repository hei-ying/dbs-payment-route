import React, { useState, useEffect, useCallback } from 'react';
import { RoutingInputs, PaymentMethod, Currency, Country } from './types';
import { calculateRoute } from './utils/routingLogic';
import { InputPanel } from './components/InputPanel';
import { RouteVisualizer } from './components/RouteVisualizer';
import { ResultCard } from './components/ResultCard';
import { Network, Share2 } from 'lucide-react';

// Default Initial State
const defaultState: RoutingInputs = {
  paymentMethod: PaymentMethod.LOCAL,
  destinationCountry: Country.HKG,
  currency: Currency.HKD,
  beneficiarySwift: 'HSBCHKHHAXXX',
  amount: 10000,
  isPOBO: false,
};

const App: React.FC = () => {
  // Initialize state from URL params if available, otherwise default
  const [inputs, setInputs] = useState<RoutingInputs>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (!params.has('currency')) return defaultState;

      const rawAmount = params.get('amount');
      const parsedAmount = rawAmount ? Number(rawAmount) : 0;
      
      return {
        paymentMethod: params.get('paymentMethod') || PaymentMethod.LOCAL,
        destinationCountry: params.get('destinationCountry') || Country.HKG,
        currency: params.get('currency') || Currency.HKD,
        beneficiarySwift: params.get('beneficiarySwift') || '',
        amount: isNaN(parsedAmount) ? 0 : parsedAmount,
        isPOBO: params.get('isPOBO') === 'true',
      };
    } catch (e) {
      console.error("Failed to parse params, using default", e);
      return defaultState;
    }
  });

  const [result, setResult] = useState(calculateRoute(inputs));
  const [showCopied, setShowCopied] = useState(false);

  // Recalculate route and update URL whenever inputs change
  useEffect(() => {
    setResult(calculateRoute(inputs));
    
    try {
      const params = new URLSearchParams();
      Object.entries(inputs).forEach(([key, value]) => {
         if (value !== undefined && value !== null) {
           params.set(key, String(value));
         }
      });
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    } catch (e) {
      // Ignore history errors in sandboxed environments
      console.warn("Could not update URL history", e);
    }
  }, [inputs]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(err => console.error("Copy failed", err));
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">支付路由可视化</h1>
              <p className="text-[11px] text-slate-500 mt-1 tracking-wide font-medium">Payment Routing Visualization</p>
            </div>
          </div>
          
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors border border-blue-100"
          >
            {showCopied ? (
               <span>已复制链接!</span>
            ) : (
               <>
                 <Share2 className="w-4 h-4" />
                 <span className="hidden sm:inline">分享配置 (Share)</span>
               </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Sidebar - Inputs */}
          <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
             <InputPanel inputs={inputs} onChange={setInputs} />
          </div>

          {/* Right Content - Visualization */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Top Result Banner */}
            <ResultCard route={result.route} />

            {/* Logic Flow */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
              <div className="mb-8 border-b border-slate-100 pb-4">
                 <h2 className="text-xl font-bold text-slate-900">路由决策路径 (Decision Path)</h2>
                 <p className="text-sm text-slate-500 mt-2">
                   优先级: 
                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 mx-1">FPS</span> &rarr; 
                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mx-1">ACT</span> &rarr; 
                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mx-1">RTGS</span> &rarr; 
                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mx-1">TT</span>
                 </p>
              </div>
              <RouteVisualizer result={result} />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
         <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
           基于 FPS/ACT/RTGS/TT 规则的支付路由逻辑模拟
         </div>
      </footer>
    </div>
  );
};

export default App;