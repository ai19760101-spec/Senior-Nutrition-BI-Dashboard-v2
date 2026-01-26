
import React, { useState } from 'react';

interface Props {
  score: number;
}

const RiskGauge: React.FC<Props> = ({ score }) => {
  const [isHovered, setIsHovered] = useState(false);

  // 基礎參數
  const centerX = 150;
  const centerY = 130; 
  const outerRadius = 100;
  const innerRadius = 75;
  
  // 將分數 (0-30) 轉換為弧度角度
  const calculateAngle = (s: number) => -180 + (s / 30) * 180;
  
  // 計算弧形路徑的 Helper
  const getArcPath = (startScore: number, endScore: number, outerR: number, innerR: number) => {
    const startAngle = calculateAngle(startScore) * (Math.PI / 180);
    const endAngle = calculateAngle(endScore) * (Math.PI / 180);
    
    const x1 = centerX + outerR * Math.cos(startAngle);
    const y1 = centerY + outerR * Math.sin(startAngle);
    const x2 = centerX + outerR * Math.cos(endAngle);
    const y2 = centerY + outerR * Math.sin(endAngle);
    
    const x3 = centerX + innerR * Math.cos(endAngle);
    const y3 = centerY + innerR * Math.sin(endAngle);
    const x4 = centerX + innerR * Math.cos(startAngle);
    const y4 = centerY + innerR * Math.sin(startAngle);
    
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`;
  };

  const needleRotation = calculateAngle(score);

  // 取得評級資訊
  const getStatusInfo = () => {
    if (score <= 17) return { label: '營養不良', category: 'Malnutrition', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' };
    if (score < 23.5) return { label: '有營養不良風險', category: 'At risk', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' };
    return { label: '營養狀況良好', category: 'Normal status', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' };
  };

  const status = getStatusInfo();

  return (
    <div 
      className="relative w-[300px] h-[220px] flex flex-col items-center group cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 工具提示 Tooltip */}
      <div 
        className={`absolute top-0 z-50 px-4 py-2 rounded-lg border shadow-xl transform transition-all duration-300 pointer-events-none ${
          isHovered ? 'opacity-100 -translate-y-8 scale-100' : 'opacity-0 translate-y-0 scale-95'
        } ${status.bg} ${status.border}`}
      >
        <div className={`text-[10px] font-black uppercase tracking-tighter ${status.color}`}>MNA Classification</div>
        <div className="text-sm font-bold text-slate-800">{status.label}</div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rotate-45 border-r border-b bg-inherit"></div>
      </div>

      <svg width="300" height="180" viewBox="0 0 300 180" className="overflow-visible">
        {/* 背景灰階區 */}
        <path d={getArcPath(0, 30, outerRadius, innerRadius)} fill="#f1f5f9" />

        {/* 紅燈區 (0-17 分) */}
        <path d={getArcPath(0, 17, outerRadius, innerRadius)} fill="#ef4444" className="hover:opacity-80 transition-opacity cursor-help" />
        
        {/* 黃燈區 (17-23.5 分) */}
        <path d={getArcPath(17, 23.5, outerRadius, innerRadius)} fill="#f59e0b" className="hover:opacity-80 transition-opacity cursor-help" />
        
        {/* 綠燈區 (23.5-30 分) */}
        <path d={getArcPath(23.5, 30, outerRadius, innerRadius)} fill="#22c55e" className="hover:opacity-80 transition-opacity cursor-help" />

        {/* 刻度標籤 */}
        <text x="35" y="155" className="text-[10px] font-bold fill-red-400 group-hover:fill-red-600 transition-colors">0-17 營養不良</text>
        <text x="118" y="20" className="text-[10px] font-bold fill-orange-400 group-hover:fill-orange-600 transition-colors">17.5-23 風險</text>
        <text x="215" y="155" className="text-[10px] font-bold fill-green-400 group-hover:fill-green-600 transition-colors">≧23.5 良好</text>

        {/* 圓心刻度數字 */}
        <text x="145" y="65" className="text-xs font-black fill-slate-300">15</text>

        {/* 指針 (Needle) */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          <g transform={`rotate(${needleRotation})`} className="transition-transform duration-1000 ease-out">
            <path 
              d="M -10 -2 L 90 0 L -10 2 Z" 
              fill="#1e293b" 
              stroke="#1e293b"
              strokeWidth="1"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
            <circle cx="0" cy="0" r="8" fill="#1e293b" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
        </g>
      </svg>
      
      {/* 底部數值區塊 */}
      <div className="mt-2 text-center">
        <div className={`text-[10px] uppercase font-bold tracking-widest mb-1 transition-colors duration-300 ${isHovered ? status.color : 'text-slate-400'}`}>
          {isHovered ? status.category : 'Current MNA Status'}
        </div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">
          MNA 總分：<span className={score <= 17 ? 'text-red-500' : score < 23.5 ? 'text-orange-500' : 'text-green-500'}>{score}</span>
        </h3>
      </div>
    </div>
  );
};

export default RiskGauge;
