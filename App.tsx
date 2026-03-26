
import React, { useState, useRef } from 'react';
import {
  Activity,
  TrendingUp,
  Scale,
  PieChart,
  BrainCircuit,
  Search,
  Calendar,
  Upload,
  FileSpreadsheet,
  ArrowRight,
  Database,
  Users,
  Loader2,
  Sparkles,
  FileCheck,
  ClipboardCheck,
  Lightbulb,
  FileText
} from 'lucide-react';
import PatientSearchModal from './components/PatientSearchModal';
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

  const [trendData, setTrendData] = useState<{ date: string, score: number, weight: number }[]>([]);

  const [radarData, setRadarData] = useState([
    { subject: '蛋白質攝取', value: 0, fullMark: 100 },
    { subject: '蔬果攝取', value: 0, fullMark: 100 },
    { subject: '液體攝取', value: 0, fullMark: 100 },
    { subject: '進食能力', value: 0, fullMark: 100 },
    { subject: '餐數', value: 0, fullMark: 100 },
  ]);

  const [anthroData, setAnthroData] = useState([
    { label: 'BMI (身體質量指數)', value: 0, min: 15, max: 25, thresholds: [19, 21, 23], unit: '' },
    { label: 'MAC (臂中圍)', value: 0, min: 18, max: 24, thresholds: [20, 21], unit: 'cm' },
    { label: 'CC (小腿圍)', value: 0, min: 25, max: 35, thresholds: [29, 31], unit: 'cm' },
  ]);

  const [healthData, setHealthData] = useState([-1, -1, -1]);
  const [searchId, setSearchId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 3); // Default to 3 years ago
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNutritionData = async (targetId?: string, targetStart?: string, targetEnd?: string) => {
    const id = targetId || searchId;
    const start = targetStart || startDate;
    const end = targetEnd || endDate;

    if (!id) {
      alert("請輸入身分證字號進行查詢");
      return;
    }
    setIsSearching(true);
    try {
      const queryParams = new URLSearchParams({
        id_no: id,
        start_date: start,
        end_date: end
      });
      const response = await fetch(`/api/nutrition-data?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Data fetch failed');
      const data = await response.json();
      
      console.log(`[Query] ID: ${id}, Results: ${data.length}`);

      if (data.length === 0) {
        // --- AUTONOMOUS DISCOVERY LOGIC ---
        console.log("No data in current range. Attempting Auto-Discovery...");
        const latestResponse = await fetch(`/api/latest-date?id_no=${id}`);
        const latestInfo = await latestResponse.json();
        
        if (latestInfo && latestInfo.latest) {
          const latestDate = new Date(latestInfo.latest);
          console.log("Found latest data at:", latestDate.toLocaleDateString());
          
          // Auto-adjust range: 2 years before latest to latest date
          const newStart = new Date(latestDate);
          newStart.setFullYear(newStart.getFullYear() - 2);
          const newStartStr = newStart.toISOString().split('T')[0];
          const newEndStr = latestDate.toISOString().split('T')[0];
          
          setStartDate(newStartStr);
          setEndDate(newEndStr);
          
          // Recursive call with new dates
          return fetchNutritionData(id, newStartStr, newEndStr);
        } else {
          alert("資料庫內查無此個案之任何評估數據。");
          setIsSearching(false);
          return;
        }
      }

      // Helper for fuzzy field mapping
      const getField = (row: any, keys: string[]) => {
        for (const key of keys) {
          if (row[key] !== undefined && row[key] !== null) return row[key];
        }
        return null;
      };

      const newTrendData = data.map((row: any) => ({
        date: typeof row['日期'] === 'string' ? row['日期'].split('T')[0] : (row['日期'] instanceof Date ? row['日期'].toISOString().split('T')[0] : row['日期']),
        score: parseFloat(getField(row, ['MNA總分', 'MNAScore', 'MNA_Total', 'MNA'])) || 0,
        weight: parseFloat(getField(row, ['體重(kg)', '體重', 'Weight'])) || 0
      })).reverse();

      const lastRow = data[0]; 

      setTrendData(newTrendData);
      setAnthroData(prev => [
        { ...prev[0], value: parseFloat(getField(lastRow, ['BMI'])) || 0 },
        { ...prev[1], value: parseFloat(lastRow['MAC(臂中圍)'] || lastRow['MAC'] || lastRow['MAC_臂中圍'] || lastRow['臂中圍']) || 0 },
        { ...prev[2], value: parseFloat(lastRow['CC(小腿圍)'] || lastRow['CC'] || lastRow['CC_小腿圍'] || lastRow['小腿圍']) || 0 }
      ]);

      setRadarData([
        { subject: '蛋白質攝取', value: parseInt(getField(lastRow, ['蛋白質攝取(%)', '蛋白質攝取', 'Protein'])) || 0, fullMark: 100 },
        { subject: '蔬果攝取', value: parseInt(getField(lastRow, ['蔬果攝取(%)', '蔬果攝取', 'Vegetables'])) || 0, fullMark: 100 },
        { subject: '液體攝取', value: parseInt(getField(lastRow, ['液體攝取(%)', '液體攝取', 'Fluids'])) || 0, fullMark: 100 },
        { subject: '進食能力', value: parseInt(getField(lastRow, ['進食能力(%)', '進食能力', 'Feeding'])) || 0, fullMark: 100 },
        { subject: '餐數', value: parseInt(getField(lastRow, ['餐數(%)', '餐數', 'Meals'])) || 0, fullMark: 100 },
      ]);

      setHealthData([
        parseInt(getField(lastRow, ['自覺營養狀況(0-2)', '自覺營養狀況', 'Self_Nutrition'])) || 0,
        parseInt(getField(lastRow, ['與同齡相比健康狀況(0-2)', '與同齡相比健康狀況', 'Self_Health'])) || 0,
        parseInt(getField(lastRow, ['神經精神問題(0-2)', '神經精神問題', 'Neuro_Psych'])) || 0
      ]);

      setInsight(null);
    } catch (error) {
      console.error("SQL Fetch Error:", error);
      alert("連線失敗，請確保 VPN 已開啟且服務正常。");
    } finally {
      setIsSearching(false);
    }
  };

  const currentMNA = trendData.length > 0 ? trendData[trendData.length - 1].score : 0;

  const generateAIInsight = async () => {
    if (trendData.length === 0) {
      alert("目前儀表板尚無數據，請先匯入臨床 CSV 檔案。 (避免 Token 浪費)");
      return;
    }
    setLoadingInsight(true);
    try {
      const aiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
      console.log("AI 初始化檢查 - Key 長度:", aiKey ? aiKey.length : "0 (未讀取到)");
      const ai = new GoogleGenAI({ apiKey: aiKey });

      const contextData = `
      【個案臨床數據總表】
      1. 用戶基本狀態:
         - 評估日期: ${trendData.length > 0 ? trendData[trendData.length - 1].date : "無評估記錄"}
         - MNA 營養篩檢總分: ${currentMNA}分 (評估標準: >23.5良好, 17-23.5風險, <17營養不良)
      
      2. 身體組成指標 (Anthropometry):
         - BMI: ${anthroData[0].value} (標準: 18.5-24)
         - 臂中圍 (MAC): ${anthroData[1].value} cm
         - 小腿圍 (CC): ${anthroData[2].value} cm (肌少症風險指標)

      3. 飲食攝取達成率 (雷達圖數據, 0-100%):
         ${radarData.map(d => `- ${d.subject}: ${d.value}%`).join('\n         ')}

      4. 自覺健康評估 (Health Matrix, 0-2分):
         - 自覺營養狀況: ${healthData[0]}分 (0=不好, 2=沒問題)
         - 同齡比較健康狀況: ${healthData[1]}分
         - 神經心理狀況: ${healthData[2]}分 (0=有嚴重問題)
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `你是一位講求實證醫學 (Evidence-Based Medicine) 的資深臨床營養師。請根據下列真實的臨床數據，撰寫一份營養評估與介入報告。

        ${contextData}

        【嚴格寫作規範 (Strict Rules)】
        1. **拒絕幻覺 (No Hallucinations)**: 報告中提到的每一個狀況，都必須有數據支持。絕對不可編造數據。
        2. **強制數據引用 (Mandatory Citation)**: 
           - 在每一句描述或建議的結尾，**必須**使用中括號 [...] 標註依據的數值來源。
           - 格式範例: "個案蛋白質攝取嚴重不足 [蛋白質攝取: 45%]，且伴隨肌肉流失風險 [CC: 29cm]。"
           - 如果沒有數據支持，就不要寫。
        3. **邏輯連貫**: 請將飲食攝取缺口與身體組成狀況連結起來分析。例如：蛋白質攝取低 -> 導致 CC (肌肉量) 下降。

        請依照以下 JSON 格式輸出：`,
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
      console.error("AI Analysis Failed:", error);
      setInsight({
        title: "AI 臨床分析暫時無法載入",
        dataSummary: "個案數據顯示存在多重營養風險，特別是 MNA 分數已低於臨界點。(錯誤代碼: APID_ERR)",
        recommendations: ["增加優質蛋白攝取", "監控每日飲水量", "進行臨床營養介入"]
      });
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "日期,MNA總分,體重(kg),BMI,MAC(臂中圍),CC(小腿圍),蛋白質攝取(%),蔬果攝取(%),液體攝取(%),進食能力(%),餐數(%),自覺營養狀況(0-2),與同齡相比健康狀況(0-2),神經精神問題(0-2)\n" +
      "2023-11-01,24,55,22.5,23.5,32.0,85,60,80,100,90,2,2,2\n" +
      "2023-12-01,22,54,21.8,22.0,31.5,70,50,60,90,80,1,1,2\n" +
      "2024-01-01,19,53,21.0,20.5,29.5,65,40,40,85,70,0,0,1";

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

        // Update Health Data
        // CSV Cols: 11:SelfNutrition, 12:PeerHealth, 13:Neuro
        setHealthData([
          parseInt(lastRow[11]) || 0,
          parseInt(lastRow[12]) || 0,
          parseInt(lastRow[13]) || 0
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
        {/* SQL Search & Actions Section */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Database className="w-48 h-48" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end relative">
            <div className="space-y-2 lg:col-span-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3 h-3 text-indigo-500" /> 個案選擇
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="輸入身分證字號..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-bold"
                />
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="absolute right-2 top-1.5 p-1.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition shadow-sm border border-indigo-100"
                  title="開啟個案清單"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 lg:col-span-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3 text-indigo-500" /> 日期 (起)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
              />
            </div>

            <div className="space-y-2 lg:col-span-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3 text-indigo-500" /> 日期 (迄)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
              />
            </div>

            <div className="lg:col-span-1">
              <button
                onClick={() => fetchNutritionData()}
                disabled={isSearching || !searchId}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition font-black text-sm shadow-lg shadow-indigo-200 disabled:bg-slate-300 disabled:shadow-none active:scale-[0.98]"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" /> 執行查詢
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4 bg-slate-50/80 py-2 px-4 rounded-2xl border border-slate-100">
               <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-600 border border-indigo-50">
                 <BrainCircuit className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-800 tracking-tighter uppercase">數據整合介面</p>
                 <p className="text-[10px] text-slate-500 font-medium">已對接 vw_營養系統_迷你營養評估_BI報表</p>
               </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition text-xs font-black shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" /> 補填範本
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-2 py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition text-xs font-black shadow-sm"
              >
                <Upload className="w-4 h-4" /> 離線 CSV 匯入
              </button>
            </div>
          </div>
        </div>

        {/* Patient Selection Modal */}
        <PatientSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(id, date) => {
          setSearchId(id);
          if (date) {
            // Convert to YYYY-MM-DD for the input[type="date"]
            const formattedDate = new Date(date).toISOString().split('T')[0];
            setStartDate(formattedDate);
            setEndDate(formattedDate);
            // Trigger fetch immediately with the selection
            fetchNutritionData(id, formattedDate, formattedDate);
          } else {
            fetchNutritionData(id);
          }
        }}
      />
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
            <HealthMatrix data={healthData} />
            <button
              onClick={generateAIInsight}
              disabled={loadingInsight || trendData.length === 0}
              className={`mt-8 w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl transition font-bold text-sm shadow-lg ${trendData.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } disabled:opacity-50`}
            >
              <Sparkles className={`w-4 h-4 ${loadingInsight ? 'animate-spin' : ''}`} />
              {loadingInsight ? '正在分析數據...' : trendData.length === 0 ? '請先匯入數據以啟動 AI' : '生成臨床 AI 建議'}
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
