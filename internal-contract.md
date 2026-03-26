# 內部開發合約 (Internal Contract v1.0)

本文件定義後端 (BE-Worker) 與前端 (FE-Worker) 之間的資料介接標準，確保 Swarm 開發過程中的黑箱協作一致性。

## 1. 資料庫視圖 (Database View)
- **名稱**：`vw_營養系統_迷你營養評估_BI報表`
- **關鍵欄位**：
  - `身分證字號` (NVarChar): 個案唯一識別碼
  - `姓名` (NVarChar): 個案姓名
  - `日期` (Date): 評估記錄日期
  - 以及其他 CSV 模組定義的 14 個營養指標欄位。

## 2. API 端點規範 (API Endpoints)

### A. 獲取個案清單 (Get Patient List)
- **路徑**：`GET /api/patients`
- **目的**：用於搜尋 Modal 的清單顯示，讓使用者可直接點選個案。
- **回傳內容 (JSON)**：
  ```json
  [
    { "身分證字號": "A123...", "姓名": "王曉明" },
    ...
  ]
  ```

### B. 執行個案數據查詢 (Get Nutrition Data)
- **路徑**：`GET /api/nutrition-data`
- **參數**：
  - `id_no`: 身分證字號 (必填)
  - `start_date`: yyyy-mm-dd (選填)
  - `end_date`: yyyy-mm-dd (選填)
- **回傳內容 (JSON)**：按日期降序排列的營養數據清單。

## 3. 前端 UI 邏輯與組件需求
- **PatientModal**：點擊搜尋圖示後開啟，顯示個案清單，支援簡單過濾，點選後將 `身分證字號` 回填至主畫面輸入框。
- **SearchButton**：新增「執行查詢」按鈕，點擊後觸發 `fetchNutritionData`。
- **Error Handling**：API 失敗時需彈跳通知提示「請檢查內網 VPN 連線」。

## 4. 角色操作邊界 (Roles Boundaries)
- **BE-Worker**：僅負責 `server/` 目錄，確保 API 符合上述合約。
- **FE-Worker**：僅負責 `App.tsx` 與組件，依據合約串接 API，禁止修改 `server/` 邏輯。
