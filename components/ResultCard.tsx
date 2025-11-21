import React from 'react';
import { RouteType } from '../types';
import { Zap, Building, Globe, Plane, Info } from 'lucide-react';

interface Props {
  route: RouteType;
}

export const ResultCard: React.FC<Props> = ({ route }) => {
  
  const config = {
    [RouteType.FPS]: {
      color: 'from-emerald-500 to-teal-600',
      icon: Zap,
      desc: 'FPS (转数快)',
      subtext: '7x24 实时到账, 本地 HKD/CNH 小额支付'
    },
    [RouteType.ACT]: {
      color: 'from-purple-500 to-indigo-600',
      icon: Building,
      desc: 'ACT (行内转账)',
      subtext: 'DBS 内部账簿划转, 实时到账, 无费用'
    },
    [RouteType.RTGS]: {
      color: 'from-blue-500 to-cyan-600',
      icon: Globe,
      desc: 'RTGS (CHATS)',
      subtext: '本地实时支付系统 (RTGS/Clearing House)'
    },
    [RouteType.TT]: {
      color: 'from-orange-500 to-red-600',
      icon: Plane,
      desc: 'TT (电汇 / SWIFT)',
      subtext: '标准跨境/跨行国际汇款, 处理时间较长'
    }
  };

  // Defensive fallback to TT or a generic error state if route is unrecognized
  const activeConfig = config[route] || config[RouteType.TT];
  
  const { color, icon: Icon, desc, subtext } = activeConfig;

  // Safety check if Icon is somehow undefined
  const DisplayIcon = Icon || Info;

  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg transform transition-all hover:shadow-xl ring-1 ring-black/5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
           <div className="text-white/80 font-bold text-xs uppercase tracking-widest border-b border-white/20 pb-1 inline-block">最终路由结果</div>
        </div>
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <DisplayIcon className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="flex items-baseline gap-3">
         <h1 className="text-5xl font-extrabold tracking-tight mb-2">{route || 'UNKNOWN'}</h1>
      </div>
      
      <div className="text-xl font-bold text-white/95">{desc}</div>
      <div className="mt-4 pt-4 border-t border-white/20 text-sm font-medium text-white/90 flex items-center gap-2">
        <span className="bg-white/20 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-bold">特点</span>
        {subtext}
      </div>
    </div>
  );
};