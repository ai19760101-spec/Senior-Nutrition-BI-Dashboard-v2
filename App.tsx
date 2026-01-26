
import React, { useState, useRef } from 'react';
import {
  Activity,
  TrendingUp,
  Scale,
  PieChart,
  BrainCircuit,
  Sparkles,
  Upload,
  FileSpreadsheet,
  FileText,
  ClipboardCheck,
  Lightbulb,
  FileCheck
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// Components
import DashboardHeader from './components/DashboardHeader';
import RiskGauge from './components/RiskGauge';
import AnthroMonitor from './components/AnthroMonitor';
import TrendChart from './components/TrendChart';
import RadarSection from './components/RadarSection';
import HealthMatrix from './components/HealthMatrix';

interface AIReport {
  title: string;
  dataSummary: string;
  recommendations: string[];
}

const App: React.FC = () => {
  const [insight, setInsight] = useState<AIReport | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [trendData, setTrendData] = useState([
    { date: '2023年7月', score: 20, weight: 55 },
    { date: '2023年8月', score: 20, weight: 55 },
    { date: '2023年9月', score: 17, weight: 52 },
    { date: '2023年10月', score: 15, weight: 52 },
  ]);

  const [radarData, setRadarData] = useState([
    { subject: '蛋白質攝取', value: 80, fullMark: 100 },
    { subject: '蔬果攝取', value: 45, fullMark: 100 },
    { subject: '液體攝取', value: 30, fullMark: 100 },
    { subject: '進食能力', value: 95, fullMark: 100 },
    { subject: '餐數', value: 70, fullMark: 100 },
  ]);

  const [anthroData, setAnthroData] = useState([
    { label: 'BMI (身體質量指數)', value: 18.5, min: 15, max: 25, thresholds: [19, 21, 23], unit: '' },
    { label: 'MAC (臂中圍)', value: 20.5, min: 18, max: 24, thresholds: [20, 21], unit: 'cm' },
    { label: 'CC (小腿圍)', value: 29.5, min: 25, max: 35, thresholds: [29, 31], unit: 'cm' },
  ]);

  const currentMNA = trendData.length > 0 ? trendData[trendData.length - 1].score : 0;

  const generateAIInsight = async () => {
    setLoadingInsight(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `作為專業營養師，請分析以下個案數據：
        - MNA 總分: ${currentMNA} (風險評估)
        - BMI: ${anthroData[0].value}
        - 飲食達成率: ${radarData.map(d => `${d.subject}: ${d.value}%`).join(', ')}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              dataSummary: { type: Type.STRING },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "dataSummary", "recommendations"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setInsight(result);
    } catch (error) {
      setInsight({
        title: "AI 臨床分析暫時無法載入",
        dataSummary: "個案數據顯示存在多重營養風險，特別是 MNA 分數已低於臨界點。",
        recommendations: ["增加優質蛋白攝取", "監控每日飲水量", "進行臨床營養介入"]
      });
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "日期,MNA總分,體重(kg),BMI,MAC(臂中圍),CC(小腿圍),蛋白質攝取(%),蔬果攝取(%),液體攝取(%),進食能力(%),餐數(%)\n" +
      "2023-11-01,24,55,22.5,23.5,32.0,85,60,80,100,90\n" +
      "2023-12-01,22,54,21.8,22.0,31.5,70,50,60,90,80\n" +
      "2024-01-01,19,53,21.0,20.5,29.5,65,40,40,85,70";

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "senior_nutrition_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(line => line.trim() !== '');
      // Remove header
      const rows = lines.slice(1);

      if (rows.length === 0) {
        alert("CSV 檔案內容為空");
        return;
      }

      try {
        const newTrendData = rows.map(row => {
          const cols = row.split(',').map(c => c.trim());
          return {
            date: cols[0],
            score: parseFloat(cols[1]) || 0,
            weight: parseFloat(cols[2]) || 0
          };
        });

        const lastRow = rows[rows.length - 1].split(',').map(c => c.trim());

        // Update Trend Data
        setTrendData(newTrendData);

        // Update Anthro Data (Map to existing structure)
        // CSV Cols: 3:BMI, 4:MAC, 5:CC
        setAnthroData(prev => [
          { ...prev[0], value: parseFloat(lastRow[3]) || 0 }, // BMI
          { ...prev[1], value: parseFloat(lastRow[4]) || 0 }, // MAC
          { ...prev[2], value: parseFloat(lastRow[5]) || 0 }  // CC
        ]);

        // Update Radar Data
        // CSV Cols: 6:Protein, 7:Veg, 8:Fluid, 9:Feeding, 10:Meals
        setRadarData([
          { subject: '蛋白質攝取', value: parseInt(lastRow[6]) || 0, fullMark: 100 },
          { subject: '蔬果攝取', value: parseInt(lastRow[7]) || 0, fullMark: 100 },
          { subject: '液體攝取', value: parseInt(lastRow[8]) || 0, fullMark: 100 },
          { subject: '進食能力', value: parseInt(lastRow[9]) || 0, fullMark: 100 },
          { subject: '餐數', value: parseInt(lastRow[10]) || 0, fullMark: 100 },
        ]);

        alert("數據匯入成功！圖表已更新。");
      } catch (error) {
        console.error("CSV Parse Error:", error);
        alert("數據格式錯誤，請確保使用正確的範本格式。");
      }
    };
    reader.readAsText(file);

    // Clear input so same file can be uploaded again
    e.target.value = '';
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50 font-sans">
      <DashboardHeader
        title="高齡營養照護 BI 健康儀表板"
        subtitle="將數據轉化為行動：專為醫護設計的迷你營養評估 (MNA®) 視覺化支援系統。"
      />

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 mt-6">
        {/* Actions Section */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><FileSpreadsheet className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-bold text-slate-800">數據引擎</p>
              <p className="text-[10px] text-slate-500">支援 MNA 標準 CSV</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition text-sm font-bold"
            >
              <FileText className="w-4 h-4" /> 下載範本
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold text-sm shadow-md">
              <Upload className="w-4 h-4" /> 匯入數據
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <div className="lg:col-span-4 xl:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center">
            <div className="flex items-center gap-2 self-start mb-6">
              <Activity className="text-indigo-600 w-5 h-5" />
              <h2 className="text-lg font-bold text-slate-800">核心風險評估</h2>
            </div>
            <RiskGauge score={currentMNA} />
          </div>

          <div className="lg:col-span-8 xl:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-8">
              <Scale className="text-indigo-600 w-5 h-5" />
              <h2 className="text-lg font-bold text-slate-800">身體組成監測指標</h2>
            </div>
            <div className="space-y-10">
              {anthroData.map((data, idx) => <AnthroMonitor key={idx} {...data} />)}
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6"><TrendingUp className="text-indigo-600 w-5 h-5" /><h2 className="text-lg font-bold text-slate-800">營養歷史趨勢</h2></div>
            <div className="h-[300px] w-full"><TrendChart data={trendData} /></div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6"><PieChart className="text-indigo-600 w-5 h-5" /><h2 className="text-lg font-bold text-slate-800">飲食攝取缺口</h2></div>
            <div className="h-[300px] w-full"><RadarSection data={radarData} /></div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6"><BrainCircuit className="text-indigo-600 w-5 h-5" /><h2 className="text-lg font-bold text-slate-800">神經心理與自覺健康</h2></div>
            <HealthMatrix />
            <button onClick={generateAIInsight} disabled={loadingInsight} className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-sm shadow-lg disabled:opacity-50">
              <Sparkles className={`w-4 h-4 ${loadingInsight ? 'animate-spin' : ''}`} /> {loadingInsight ? '正在分析數據...' : '生成臨床 AI 建議'}
            </button>
          </div>
        </div>

        {/* AI Insight UI */}
        {insight && (
          <div className="mt-6 p-6 bg-white border border-indigo-100 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
              <div className="p-2 bg-indigo-600 rounded-lg text-white"><FileCheck className="w-5 h-5" /></div>
              <h3 className="text-lg font-black text-slate-800">{insight.title}</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">臨床數據摘要</p>
                <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                  {insight.dataSummary}
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3">優先臨床建議</p>
                <ul className="space-y-3">
                  {insight.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-4 text-sm text-slate-700 items-start group">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">{idx + 1}</span>
                      <p className="font-medium pt-0.5">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-[1400px] mx-auto px-6 mt-12 pb-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-400 border-t border-slate-200 pt-8">
        <p>© 2024 高齡營養照護系統 v3.2 | Nestlé Nutrition Institute MNA® Authorized</p>
        <div className="flex gap-6 font-bold">
          <span className="hover:text-indigo-600 cursor-pointer transition">隱私權條款</span>
          <span className="hover:text-indigo-600 cursor-pointer transition">臨床操作手冊</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
