
import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface Props {
  data: any[];
}

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
      <div className="bg-white/98 backdrop-blur-md p-3 border border-slate-200 shadow-2xl rounded-2xl min-w-[240px] animate-in fade-in zoom-in-95 duration-200 pointer-events-none z-[100]">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[11px] font-black text-slate-800">{item.subject}</p>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {item.value}%
          </span>
        </div>
        
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out" 
            style={{ width: `${item.value}%` }}
          ></div>
        </div>

        <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
          {meta.desc}
        </p>
        
        <div className="flex items-start gap-2 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1 shrink-0"></div>
          <p className="text-[9px] text-blue-700 font-bold leading-tight">
            {meta.tip}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const RadarSection: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data} margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
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
          cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Radar
          name="達成率"
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="#3b82f6"
          fillOpacity={0.15}
          activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3 }}
          dot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarSection;
