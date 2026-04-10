import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // 1. Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(500).json({ error: 'Vercel Environment Variable GEMINI_API_KEY is missing.' });
    }

    const clinicalData = req.body;
    const genAI = new GoogleGenerativeAI(geminiKey);
    
    // Gemini 3.1 Hierarchy Fallback Logic
    const MODEL_HIERARCHY = [
      "gemini-3.1-pro-preview",
      "gemini-3.1-flash-lite-preview",
      "gemini-3-flash-preview"
    ];

    let result;
    let lastError;
    let usedModel = "";

    const prompt = `你是一位講求實證醫學 的資深臨床營養師。請根據下列真實的臨床數據，撰寫一份營養評估與介入報告。
    
    【個案臨床數據總表】
    ${JSON.stringify(clinicalData, null, 2)}

    【嚴格寫作規範 (Strict Rules)】
    1. **拒絕幻覺**: 報告中提到的每一個狀況，都必須有數據支持。
    2. **強制數據引用**: 在每一句建議結尾標註依據，例如: [蛋白質攝取: 45%], [CC: 29cm]。
    3. **格式要求**: 請依照以下 JSON 格式輸出：
       { "title": "...", "dataSummary": "...", "recommendations": ["...", "..."] }`;

    for (const modelId of MODEL_HIERARCHY) {
      try {
        console.log(`Executing analysis with hierarchy tier: ${modelId}`);
        const model = genAI.getGenerativeModel({ 
          model: modelId,
          generationConfig: { responseMimeType: "application/json" }
        });
        
        result = await model.generateContent(prompt);
        if (result) {
          usedModel = modelId;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Hierarchy tier [${modelId}] failed:`, err.message);
        continue; // Try next model in sequence
      }
    }

    if (!result) {
      throw new Error(`All hierarchy models failed. Last error: ${lastError?.message}`);
    }

    console.log(`Success using model: ${usedModel}`);
    
    const response = await result.response;
    let text = response.text();
    
    console.log('Gemini raw output:', text);

    // Robust JSON extraction (in case AI adds markdown fences or extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    try {
      res.status(200).json(JSON.parse(text));
    } catch (parseErr) {
      console.error('JSON Parse Error:', text);
      res.status(200).json({
        title: "分析解析失敗",
        dataSummary: "AI 輸出格式非標準 JSON，請重試。(RAW: " + text.substring(0, 100) + ")",
        recommendations: ["再次點擊分析按鈕", "確認數據完整性"]
      });
    }

  } catch (err) {
    console.error('Vercel AI Generation Failed:', err);
    // Return specific error to frontend for debugging
    res.status(200).json({ 
      title: "AI 臨床分析暫時無法載入",
      dataSummary: `個案數據分析中遇到技術問題: ${err.message}`,
      recommendations: ["檢查 Gemini API 金鑰有效性", "確認 Vercel 環境變數已生效 (Deployments -> Redeploy)", "若持續失敗，請聯絡系統管理員或檢查 Google API Quota"]
    });
  }
}
