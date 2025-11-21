import React from 'react';
import { RoutingResult, LogicStepResult, RouteType } from '../types';
import { Check, ArrowDown, CornerDownRight, Ban } from 'lucide-react';

interface Props {
  result: RoutingResult;
}

export const RouteVisualizer: React.FC<Props> = ({ result }) => {
  
  if (!result || !result.steps) {
    return <div className="p-4 text-gray-500">Initializing visualization...</div>;
  }

  return (
    <div className="flex flex-col gap-6 relative pl-2 md:pl-4">
      {/* Connecting Line Background */}
      <div className="absolute left-[2.5rem] md:left-[3.5rem] top-4 bottom-20 w-0.5 bg-gray-100 -z-10"></div>

      {result.steps.map((step, index) => {
        // Determine state of this step
        const isDecisiveStep = step.isMatch;
        // If a previous step was a match, this step is "unreachable" / "skipped"
        const previousStepMatched = result.steps.slice(0, index).some(s => s.isMatch);
        const isSkipped = previousStepMatched;
        
        return (
          <div key={index} className={`relative transition-all duration-500 ${isSkipped ? 'opacity-30 grayscale' : 'opacity-100'}`}>
            <LogicNode 
              step={step} 
              isFinalResult={step.isMatch}
              finalRoute={isDecisiveStep ? result.route : undefined}
            />
            
            {!isDecisiveStep && !isSkipped && index < result.steps.length - 1 && (
               <div className="hidden md:flex flex-col items-center absolute left-6 -bottom-8 w-12 text-gray-300">
                  <ArrowDown className="w-5 h-5" />
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface NodeProps {
  step: LogicStepResult;
  isFinalResult: boolean;
  finalRoute?: RouteType;
}

const LogicNode: React.FC<NodeProps> = ({ step, isFinalResult, finalRoute }) => {
  
  const getRouteColor = (r?: RouteType) => {
    switch(r) {
      case RouteType.FPS: return 'bg-emerald-50 text-emerald-900 border-emerald-500 ring-emerald-100';
      case RouteType.ACT: return 'bg-purple-50 text-purple-900 border-purple-500 ring-purple-100';
      case RouteType.RTGS: return 'bg-blue-50 text-blue-900 border-blue-500 ring-blue-100';
      case RouteType.TT: return 'bg-orange-50 text-orange-900 border-orange-500 ring-orange-100';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getBadgeColor = (r?: RouteType) => {
      switch(r) {
      case RouteType.FPS: return 'bg-emerald-600';
      case RouteType.ACT: return 'bg-purple-600';
      case RouteType.RTGS: return 'bg-blue-600';
      case RouteType.TT: return 'bg-orange-600';
      default: return 'bg-gray-500';
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      
      {/* Icon Marker */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full border-4 flex items-center justify-center z-10 relative bg-white transition-colors duration-300
        ${isFinalResult ? 'border-green-500 shadow-md' : 'border-gray-100'}
      `}>
        {isFinalResult ? (
          <Check className="w-6 h-6 text-green-600" />
        ) : (
          <div className="relative">
            <Ban className="w-6 h-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content Card */}
      <div className={`flex-1 p-5 rounded-xl border shadow-sm transition-all duration-300 bg-white
        ${isFinalResult ? `ring-4 ${getRouteColor(finalRoute)}` : 'border-gray-100 hover:border-gray-200'}
      `}>
        <div className="flex justify-between items-start mb-3">
           <h3 className="font-bold text-gray-800 text-base md:text-lg">{step.stepName}</h3>
           {isFinalResult && finalRoute && (
             <span className={`${getBadgeColor(finalRoute)} text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm tracking-wide`}>
               MATCHED
             </span>
           )}
        </div>

        <div className="space-y-2 mb-4 bg-white/50 p-2 rounded-lg border border-transparent">
          {step.criterias.map((crit, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
               <div className={`mt-1 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border text-[10px] font-bold ${crit.met ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-50 border-red-200 text-red-400'}`}>
                 {crit.met ? "✓" : "✕"}
               </div>
               <span className={`${crit.met ? 'text-gray-700 font-medium' : 'text-gray-400 line-through decoration-gray-300'}`}>
                 {crit.label}
               </span>
            </div>
          ))}
        </div>

        {isFinalResult ? (
           <div className="flex items-center gap-2 text-sm font-bold border-t border-black/5 pt-2 mt-2">
              <CornerDownRight className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">最终结果: <span className="text-lg ml-1 text-black">{finalRoute}</span></span>
           </div>
        ) : (
           <div className="p-2 bg-gray-50 rounded border border-gray-100 text-xs text-gray-400 flex items-center gap-2">
              <ArrowDown className="w-3 h-3" />
              不满足条件，继续下一优先级...
           </div>
        )}

      </div>
    </div>
  );
};