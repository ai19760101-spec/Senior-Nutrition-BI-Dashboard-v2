
import React from 'react';
import { Frown, Meh, Smile } from 'lucide-react';

const HealthMatrix: React.FC = () => {
  const rows = [
    { label: '自覺營養狀況', value: 0 },
    { label: '與同齡者相比健康狀況', value: 0 },
    { label: '神經精神問題 (失智或憂鬱)', value: 0 },
  ];

  const levels = [
    { label: '覺得非常不好 (0分)', icon: Frown, color: 'text-red-500', bg: 'bg-red-50' },
    { label: '普通 (1分)', icon: Meh, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: '沒有問題 (2分)', icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2 items-center text-[10px] text-slate-400 font-bold mb-1">
        <div></div>
        <div className="text-center">自覺<br/>營養狀況</div>
        <div className="text-center">與同齡相比<br/>健康狀況</div>
        <div className="text-center">神經精神問題<br/>(失智或憂鬱)</div>
      </div>

      {levels.map((lvl, lIdx) => (
        <div key={lIdx} className="grid grid-cols-4 gap-2 items-center">
          <div className="text-[10px] font-bold text-slate-500 pr-2 border-r border-slate-100 h-full flex items-center justify-end">
            {lvl.label}
          </div>
          {rows.map((row, rIdx) => {
             // In the mock image, the top row (0 points) is all selected
             const isActive = lIdx === 0;
             const Icon = lvl.icon;
             return (
               <div key={rIdx} className="flex justify-center">
                 <div className={`p-3 rounded-full transition-all duration-500 ${isActive ? `${lvl.bg} ${lvl.color} ring-2 ring-offset-2 ring-red-100 shadow-sm` : 'text-slate-200 opacity-30'}`}>
                   <Icon className="w-6 h-6" />
                 </div>
               </div>
             );
          })}
        </div>
      ))}

      <div className="mt-6 flex justify-between items-center text-[10px] text-slate-500 bg-slate-50 p-3 rounded-lg">
        <p className="flex items-center gap-1 font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          提示問題可能不只在於食物
        </p>
        <p className="font-bold underline cursor-pointer text-blue-600">提供跨領域轉介依據</p>
      </div>
    </div>
  );
};

export default HealthMatrix;
