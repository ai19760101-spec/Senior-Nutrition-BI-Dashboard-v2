# Antigravity 學習筆記：Vercel 部署與資安實戰

這份文件記錄了我們將「Senior Nutrition BI Dashboard」部署到 Vercel 的完整過程，包含了遇到的坑與解決方案。

---

## 1. Vercel 部署流程 (Deployment Workflow)

### 為什麼是 Vercel？

- **極速 (Fast)**: 專為前端框架 (React, Next.js, Vue) 優化。
- **自動化 (Automated)**: 只要 `git push` 到 GitHub，Vercel 就會自動抓取代碼並重新部署。
- **免費 (Free Hobby Plan)**: 對於個人展示專案非常友善，擁有巨大的流量額度。

### 操作步驟

1. **連結 GitHub**: 在 Vercel 註冊並連結 GitHub 帳號。
2. **Import Project**: 選擇您的 GitHub Repository (例如 `Senior-Nutrition-BI-Dashboard`)。
3. **設定 Framework**: 選擇 `Vite` (通常會自動偵測)。
4. **設定環境變數 (Environment Variables)**:
    - 這是關鍵！因為我們的代碼需要 `API Key` 才能運作。
    - **Name**: `VITE_GEMINI_API_KEY`
    - **Value**: `您的 AI Studio 金鑰`

---

## 2. 資安事故與修復實錄 (Security Incident & Fix)

### 發生了什麼事？

- 我們在這一版更新中，意外將包含 API Key 的 `.env` 檔案推送 (Push) 到了 GitHub 公開庫。
- **後果**: Google 的秘密掃描機器人 (Secret Scanning) 立刻發現，並為了安全起見，自動作廢了那把 Key。這導致本地和雲端的 AI 功能全部失效。

### 解決方案 (The Fix)

1. **申請新 Key**: 舊的已經不安全，必須作廢。
2. **升級 `.gitignore`**:
    - 在 `.gitignore` 檔案中加入 `.env`。
    - 執行 `git rm --cached .env` 從 Git 紀錄中刪除它。
    - 這確保了未來的 Key **永遠只留在您自己的電腦裡**，不會被上傳。
3. **更新環境變數**:
    - 本地：更新 `.env` 檔案。
    - 雲端：更新 Vercel 的 Environment Variables，並執行 **Redeploy**。

---

## 3. 環境變數的奧義 (Environment Variables)

### 為什麼 Vercel 抓不到我的 Key？

- **原因**: 前端安全限制。瀏覽器端的代碼不能隨意讀取伺服器的變數。
- **Vite 的規定**: 只有 **`VITE_`** 開頭的變數 (例如 `VITE_APP_TITLE`)，Vite 才會把它打包進網頁裡。
- **解決方法**:
  - 在 Vercel 設定變數時，名稱一定要叫 `VITE_GEMINI_API_KEY`。
  - 在代碼中讀取時，使用 `import.meta.env.VITE_GEMINI_API_KEY`。
  - 我們也在 `App.tsx` 中做了相容性處理，同時支援 `process.env` (備用)。

---

## 4. 偵錯技巧 (Debugging Tips)

當網頁部署上去但功能壞掉時，怎麼辦？

1. **按 F12 (開發者工具)**: 這是工程師的聽診器。
2. **看 Console (主控台)**:
    - 紅字通常就是錯誤原因。
    - 我們特別加了 `console.log("AI 初始化檢查 - Key 長度: ...")`，讓我們能一秒判斷是 Key 沒帶進去 (長度 0) 還是 API 報錯 (長度 39)。

---

## 結語

這次經驗證明了 **「DevOps (開發運維)」** 的重要性。寫好代碼只是第一步，如何安全、自動地把它送到使用者面前，才是真正的挑戰。

*Project Date: 2026-01-26*
*Architect: Antigravity*
