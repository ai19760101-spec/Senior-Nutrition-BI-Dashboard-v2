
import React from 'react';
import { Home, Users, Settings, Bell, Menu } from 'lucide-react';

interface Props {
  title: string;
  subtitle: string;
}

const DashboardHeader: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-indigo-600 p-2 rounded-xl text-white font-black text-xl md:text-2xl shadow-lg shadow-indigo-100">N</div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-none">{title}</h1>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                Clinical BI <span className="mx-1 opacity-30">•</span> 2024 V3.2
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden lg:flex items-center gap-5 text-slate-500">
              <Home className="w-5 h-5 cursor-pointer hover:text-indigo-600 transition" />
              <Users className="w-5 h-5 cursor-pointer hover:text-indigo-600 transition" />
              <Settings className="w-5 h-5 cursor-pointer hover:text-indigo-600 transition" />
            </div>
            
            <div className="flex items-center gap-3 md:gap-4 pl-4 md:pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-800">臨床營養師</p>
                <p className="text-[10px] font-bold text-slate-400">醫學中心 A 區</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <div className="lg:hidden text-slate-600">
                <Menu className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-50/50 p-3 md:p-4 rounded-xl border border-indigo-100">
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
            <span className="text-indigo-600 font-bold">最新摘要：</span>系統已自動識別個案的營養風險等級。建議參考 AI 產生的臨床介入計畫以優化照護成效。
          </p>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
