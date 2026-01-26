# Senior Nutrition BI Dashboard (高齡營養照護 BI 健康儀表板)

![React](https://img.shields.io/badge/React-19-blue.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-61dafb.svg)
![AI](https://img.shields.io/badge/Gemini-3.0%20Flash-orange.svg)

這是一個專為臨床營養師設計的決策支援儀表板，將 **Mini Nutritional Assessment (MNA®)** 的篩檢數據轉化為直觀的商業智慧 (BI) 視覺化洞察。

## 🌟 核心功能

- **臨床級風險儀表 (Risk Gauge)**：自動分類營養不良、有風險與正常狀態。
- **身體組成監測 (Anthro Monitor)**：視覺化 BMI、臂中圍與小腿圍的臨床閾值警示。
- **多維度趨勢分析**：整合體重變化與 MNA 分數的長期追蹤圖表。
- **飲食缺口雷達圖**：精確識別蛋白質、蔬果、水分攝取不足之項目。
- **Gemini AI 臨床建議**：一鍵生成結構化的臨床介入計畫與數據摘要。
- **全響應式設計 (RWD)**：支援手機、平板與桌機，隨時隨地查閱病房數據。

## 🛠️ 技術規格

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: Recharts, Lucide Icons
- **AI Engine**: Google Gemini API (@google/genai)

## 🚀 快速開始

1. **複製儲存庫**
   ```bash
   git clone https://github.com/ai19760101-spec/Senior-Nutrition-BI-Dashboard.git
   ```
2. **設定環境變數**
   請確保已配置 `API_KEY` 以使用 Gemini AI 功能。

3. **匯入數據**
   支援標準 CSV 格式匯入（系統內提供範本下載）。

---
© 2024 高齡營養照護系統開發團隊 | 遵循 MNA® 臨床篩檢標準流程