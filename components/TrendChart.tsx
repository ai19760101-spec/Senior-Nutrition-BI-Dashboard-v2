
import React from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface Props {
  data: any[];
}

const TrendChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#64748b' }} 
        />
        <YAxis 
          yAxisId="left" 
          orientation="left" 
          axisLine={false} 
          tickLine={false} 
          domain={[10, 25]}
          tick={{ fontSize: 11, fill: '#64748b' }}
          label={{ value: 'MNA 總分', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fill: '#94a3b8' } }}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          axisLine={false} 
          tickLine={false} 
          domain={[40, 60]}
          tick={{ fontSize: 11, fill: '#64748b' }}
          label={{ value: '體重 (kg)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 10, fill: '#94a3b8' } }}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
            fontSize: '12px',
            padding: '10px'
          }}
          labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
          itemStyle={{ padding: '2px 0' }}
          cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
        />
        <Legend 
          verticalAlign="top" 
          align="right" 
          iconType="circle" 
          wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} 
        />
        
        {/* Risk Thresholds */}
        <ReferenceLine yAxisId="left" y={17} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: '17', fill: '#ef4444', fontSize: 10 }} />
        <ReferenceLine yAxisId="left" y={23.5} stroke="#eab308" strokeDasharray="3 3" label={{ position: 'right', value: '23.5', fill: '#eab308', fontSize: 10 }} />

        <Bar 
          yAxisId="right" 
          dataKey="weight" 
          name="體重 (kg)" 
          fill="#bfdbfe" 
          radius={[4, 4, 0, 0]} 
          barSize={40} 
        />
        <Line 
          yAxisId="left" 
          type="monotone" 
          dataKey="score" 
          name="MNA 總分" 
          stroke="#1e293b" 
          strokeWidth={2} 
          dot={{ r: 4, fill: '#1e293b', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
