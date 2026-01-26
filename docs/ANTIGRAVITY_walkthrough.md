# Senior Nutrition BI Dashboard - 專案導覽 (Project Walkthrough)

## 專案概述 (Overview)

這是一個結合現代前端技術與 AI 的醫療級儀表板，旨在幫助醫護人員快速解讀高齡者的營養狀態。

## 核心功能展示 (Features)

### 1. 互動式數據圖表

- **MNA 趨勢圖 (Line Chart)**: 追蹤長者營養分數與體重變化。
- **營養雷達圖 (Radar Chart)**: 多維度分析飲食攝取 (蛋白質、蔬果、水分)。
- **健康矩陣 (Health Matrix)**: 視覺化呈現神經心理與自覺健康狀態。

### 2. AI 臨床輔助 (Clinical AI Assistant)

- **智能分析**: 整合所有圖表數據，生成結構化的臨床建議報告。
- **引用機制**: 每一條建議都會標註數據來源 (例如 `[MNA: 12分]`)，避免 AI 幻覺。

### 3. 數據管理

- **CSV 匯入/匯出**: 支援標準格式 CSV 檔案操作，方便與 EHR 系統對接。
- **隱私優先**: 所有數據處理均在瀏覽器端 (Client-side) 進行，不經過額外後端伺服器。

## 部署與發布 (Deployment)

- **平台**: Vercel
- **架構**: Static Site Generation (SSG) with Client-side API Calls
- **網址**: (請填入您的 Vercel 網址)

## 開發者筆記 (Developer Notes)

- **API Key Security**: 專案使用 `VITE_GEMINI_API_KEY` 進行環境變數管理，確保 Key 不會洩漏至 GitHub。
- **Performance**: 使用 React.memo 與 Lazy Loading 優化大型組件渲染。
