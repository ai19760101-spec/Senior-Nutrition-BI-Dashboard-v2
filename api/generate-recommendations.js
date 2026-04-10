const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
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
    
    // Fallback logic for model names
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } catch (e) {
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    const generationConfig = {
      responseMimeType: "application/json",
    };

    const prompt = `你是一位講求實證醫學 的資深臨床營養師。請根據下列真實的臨床數據，撰寫一份營養評估與介入報告。
    
    【個案臨床數據總表】
    ${JSON.stringify(clinicalData, null, 2)}

    【嚴格寫作規範 (Strict Rules)】
    1. **拒絕幻覺**: 報告中提到的每一個狀況，都必須有數據支持。
    2. **強制數據引用**: 在每一句建議結尾標註依據，例如: [蛋白質攝取: 45%], [CC: 29cm]。
    3. **格式要求**: 請依照以下 JSON 格式輸出：
       { "title": "...", "dataSummary": "...", "recommendations": ["...", "..."] }`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig
    });
    
    const response = await result.response;
    const text = response.text();
    
    // Ensure accurate JSON parsing
    res.status(200).json(JSON.parse(text));

  } catch (err) {
    console.error('Vercel AI Generation Failed:', err);
    res.status(500).json({ error: `AI 服務回傳錯誤: ${err.message}` });
  }
};
