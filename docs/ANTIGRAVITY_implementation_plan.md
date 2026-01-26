# Senior Nutrition BI Dashboard - 執行計畫 (Implementation Plan)

## 目標 (Goal)

建立一個專為高齡營養評估設計的互動式 BI 儀表板，整合 MNA (微型營養評估) 數據、生化指標與身體測量數據，利用 AI 生成個性化臨床建議。

## 技術棧 (Tech Stack)

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS
- **Charting**: Recharts (Responsive & Interactive)
- **AI Integration**: Google Gemini 2.0 Flash (via `@google/genai` SDK)
- **Deployment**: Vercel (CI/CD)

## 核心架構 (Core Architecture)

### 1. 數據流 (Data Flow)

- **Input**: CSV 檔案 (UTF-8) 或 預設空數據
- **Processing**:
  - `ImportExport.tsx` 解析 CSV
  - `App.tsx` 作為 State Store 管理所有數據 (`trendData`, `radarData`, `anthroData`, `healthData`)
- **Output**:
  - React Components (Charts, Gauges, Matrix)
  - AI Generated Report (Markdown format)

### 2. AI 整合策略 (AI Strategy)

- **Prompt Engineering**:
  - 使用結構化 Prompt (Role, Context, Task, Output Format)
  - 強制引用數據來源 (Citation Enforcement)
- **Cost Optimization**:
  - `App.tsx`: 在數據為空時自動阻斷 API 呼叫 (Guard Clause)
  - Client-side key handling via `.env` & Vercel environment variables

### 3. 部署與資安 (Deployment & Security)

- **Key Management**:
  - Local: `.env` (gitignored)
  - Production: Vercel Environment Variables
  - Code: 使用 `import.meta.env.VITE_` 前綴讀取
- **CI/CD**:
  - GitHub Push -> Vercel Build -> Production Deploy

## 驗證計畫 (Verification Plan)

### 自動化測試

- [x] `npm run build`: 確認 TypeScript 編譯無誤
- [x] `npm run lint`: 確認代碼風格一致

### 手動測試 (Manual QA)

- [x] **空狀態**: Load page -> check empty charts -> check disabled AI button
- [x] **數據匯入**: Import CSV -> check charts update -> AI button enabled
- [x] **AI 生成**: Click AI -> check loading spinner -> check report content
- [x] **部署**: Visit Vercel URL -> check all features (especially AI call)
