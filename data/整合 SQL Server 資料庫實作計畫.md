# 整合 SQL Server 資料庫實作計畫

這個計畫的目標是將原本基於 CSV 的靜態資料匯入/匯出機制，全面轉換為直接連接內網的 SQL Server 資料庫（取代圖一中的操作流程）。

## 架構設計提案 (Architecture)
由於前端 SPA (React + Vite) 存在安全性與 CORS 限制，無法（且不應該）直接連線至 MS SQL Server。因此，我們需要建立一個輕量級的 Backend 中介層。

1. **建立輕量級後端中介層 (Node.js + Express)**
   - 在專案根目錄內新增 `server` 目錄，並建立 Express 伺服器。
   - 使用 `mssql` 套件連接內網資料庫 (`172.23.19.168`)。
   - 建立 `/api/nutrition-data` 等 RESTful API 端點，將 SQL 查詢結果轉化為原本 CSV 對應的 JSON 陣列格式供前端使用。

2. **前端介面修改 (React UI)**
   - 將原本的「匯入數據」按鈕邏輯拔除，改為「從資料庫載入 (Fetch from DB)」的行為，點擊後會呼叫後端 API。
   - 修改 `vite.config.ts`，加入 `proxy` 設定，在開發環境中自動將前端對 `/api` 的請求轉發給後端。
   - (選擇性) 原本的「下載範本」按鈕可改為「上傳至資料庫 (Sync to DB)」或是隱藏。

3. **雙重啟動機制**
   - 透過 `concurrently` 工具，讓您執行 `npm run dev` 時，同時啟動 Vite (前端) 與 Express (後端)，維持無縫的開發體驗。

## User Review Required
> [!IMPORTANT]
> **您需要提供資料表欄位的對應細節 (Mapping)**
> 
> 目前 `SQLDB.txt` 中僅有伺服器位置、帳號與密碼。為了進行整合，我們遭遇以下疑問，需請您協助釐清：
> 1. **資料表真實名稱**：文件中的 `營養系統_迷你營養評估/基本資料_個案` 含有斜線 (`/`)。這代表這是一個跨表的 JOIN（視圖 View），還是資料庫中確實有此特殊命名的資料表？在撰寫 SQL 語法時的確切 Table Name 是什麼？
> 2. **欄位名稱對應**：原本 `senior_nutrition_template.csv` 中的資料欄位包含了：
>    `日期`, `MNA總分`, `體重(kg)`, `BMI`, `MAC(臂中圍)`, `CC(小腿圍)`, `蛋白質攝取(%)`, `蔬果攝取(%)`, `液體攝取(%)`, `進食能力(%)`, `餐數(%)`, `自覺營養狀況(0-2)`, `與同齡相比健康狀況(0-2)`, `神經精神問題(0-2)`
>    **問題：上述這些 CSV 欄位，在您的 MS SQL 資料表 (`Wheat_DB`) 中，對應的「資料庫欄位名稱（DB Column Names）」為何？（例如：`日期` 可能對應 `RecordDate`，`MNA總分` 可能對應 `MNA_Score`）。**
> 
> 在取得您確認的結構對應前，我們將暫時無法撰寫確切的 SQL SELECT 查詢。

## Proposed Changes

### 後端層 (Backend API)
#### [NEW] `server/index.js`
- 建立 Express 伺服器，負責監聽特定 Port (例如 3001)。
- 定義 `/api/data` 路由，處理前端的 GET / POST 請求。

#### [NEW] `server/db.js`
- 使用 `mssql` 實作資料庫連線池 (Connection Pool)。
- 代入 `SQLDB.txt` 的連線參數 (`172.23.19.168`, `Wheat_admin`, `Wheat_DB` 等)。

### 前端層 (Frontend SPA)
#### [MODIFY] `package.json`
- 安裝後端所需套件：`npm i express mssql cors dotenv`
- 安裝開發工具：`npm i -D concurrently nodemon`
- 修改啟動腳本 `"dev"` 為 concurrently 執行前後端。

#### [MODIFY] `vite.config.ts`
- 新增 `server.proxy` 規則，代理 `/api` 請求至後端伺服器 (http://localhost:3001)。

#### [MODIFY] `src/App.tsx` (或者包含匯入按鈕的 Navbar)
- 移除既有的檔案上傳解析 (PapaParse) 邏輯。
- 將按鈕功能綁定至 `fetch('/api/data')`，取得後端從資料庫查詢並組裝好的 JSON，並直接透過 `setData()` 灌入圖表狀態中。

## Verification Plan
1. **依賴環境檢查**：編寫腳本自動執行 `npm install` 並確認 `mssql`, `express`, `concurrently` 安裝無誤。
2. **前後端啟動測試**：執行 `npm run dev`，確保伺服器 Console 沒有錯誤崩潰。
3. **使用者手動驗證**：
   - 使用者確保本機已開啟 SSL VPN 進入內網環境。
   - 點擊前端 UI 上新的「從資料庫載入數據」按鈕。
   - 驗證後端能否成功連線至 `172.23.19.168`，發送 SQL Query，並觀察前端圖表是否如預期呈現代入 SQL 取得之數據。
