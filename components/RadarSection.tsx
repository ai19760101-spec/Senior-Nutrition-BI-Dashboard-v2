
import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface Props {
  data: any[];
  keys: string[];
}

// Color palette for multiple series
const colorPalette = [
  { stroke: '#3b82f6', fill: '#3b82f6' }, // Blue (Latest)
  { stroke: '#f43f5e', fill: '#f43f5e' }, // Rose (Previous 1)
  { stroke: '#10b981', fill: '#10b981' }, // Emerald (Previous 2)
  { stroke: '#f59e0b', fill: '#f59e0b' }, // Amber (Previous 3)
  { stroke: '#8b5cf6', fill: '#8b5cf6' }, // Violet
  { stroke: '#ec4899', fill: '#ec4899' }, // Pink
];

// Clinical metadata for nutritional categories
const categoryMeta: Record<string, { desc: string; tip: string }> = {
  '蛋白質攝取': { 
    desc: '包含豆魚蛋肉類。高齡者維持肌肉量與免疫力的關鍵營養素。', 
    tip: '建議目標：1.2 - 1.5 公克 / 每公斤體重。' 
  },
  '蔬果攝取': { 
    desc: '維生素、礦物質與膳食纖維的主要來源，有助抗氧化與腸道健康。', 
    tip: '建議目標：每日至少 3 份蔬菜、2 份水果。' 
  },
  '液體攝取': { 
    desc: '包含飲水、湯品與各類不含酒精飲品。預防脫水與輔助代謝。', 
    tip: '建議目標：每天攝取 1500c.c. - 2000c.c.。' 
  },
  '進食能力': { 
    desc: '評估咀嚼、吞嚥與自我進食的生理功能。影響營養攝取的第一關。', 
    tip: '若低於 80%，建議諮詢語言治療師或牙科。' 
  },
  '餐數': { 
    desc: '每日正餐的頻率與規律性，反應食慾狀況與日常作息穩定度。', 
    tip: '少量多餐可幫助消化不良或食慾不佳者。' 
  },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const meta = categoryMeta[item.subject] || { 
      desc: '此項目的營養攝取達成率。', 
      tip: '請參考臨床營養指引建議。' 
    };
    
    return (
      <div className="bg-white/98 backdrop-blur-md p-4 border border-slate-200 shadow-2xl rounded-2xl min-w-[280px] animate-in fade-in zoom-in-95 duration-200 pointer-events-none z-[100]">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-black text-slate-800">{item.subject}</p>
        </div>
        
        <div className="space-y-3 mb-4">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-500 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  {entry.name}
                </span>
                <span className="font-black text-slate-800">{entry.value}%</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${entry.value}%`, backgroundColor: entry.color }} 
                ></div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed mb-3 italic">
          {meta.desc}
        </p>
        
        <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-600 font-bold leading-tight">
            {meta.tip}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

import { Lightbulb } from 'lucide-react';

const RadarSection: React.FC<Props> = ({ data, keys }) => {
  // Use provided keys or default to 'value' if none
  const radarKeys = keys && keys.length > 0 ? keys : ['value'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data} margin={{ top: 0, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="#f1f5f9" strokeDasharray="3 3" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={false} 
          axisLine={false} 
        />
        <Tooltip 
          content={<CustomTooltip />} 
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: '10px', fontWeight: 800, color: '#64748b', paddingTop: '10px' }}
        />
        {radarKeys.map((key, index) => (
          <Radar
            key={key}
            name={key === 'value' ? '達成率' : key}
            dataKey={key}
            stroke={colorPalette[index % colorPalette.length].stroke}
            strokeWidth={index === 0 ? 3 : 1.5}
            fill={colorPalette[index % colorPalette.length].fill}
            fillOpacity={index === 0 ? 0.15 : 0.05}
            activeDot={{ r: 6, fill: colorPalette[index % colorPalette.length].stroke, stroke: '#fff', strokeWidth: 3 }}
            dot={index === 0 ? { r: 4, fill: colorPalette[index % colorPalette.length].stroke, stroke: '#fff', strokeWidth: 2 } : false}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarSection;
