const express = require('express');
const cors = require('cors');
const { mssql, poolPromise, geminiKey } = require('./dbConfig.cjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const line = require('@line/bot-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// --- Enterprise Bridge v2.0: Security Whitelist ---
const ALLOWED_TABLES = [
    'vw_營養系統_迷你營養評估_BI報表',
    '基本資料_個案',
    'Residents',
    'RepairRequests',
    'Staff',
    'RepairCategories',
    'NotificationTemplates',
];

// --- Generic SQL Proxy Endpoint (Protected) ---
app.post('/api/db/query', async (req, res) => {
    try {
        const { tableName, columns = '*', filters = {} } = req.body;

        // 1. 安全檢查：白名單校驗
        if (!ALLOWED_TABLES.includes(tableName)) {
            console.warn(`Unauthorized access attempt to table: ${tableName}`);
            return res.status(403).json({ error: `未授權存取表格: ${tableName}。請洽管理員增加白名單。` });
        }

        const pool = await poolPromise;
        if (!pool) return res.status(503).json({ error: '資料庫未連線' });

        const request = pool.request();
        
        // 2. 動態構建安全 SELECT 語句 (Read-Only)
        // 注意：此處應對 columns 進行額外清理，防止惡意注入
        let selectCols = Array.isArray(columns) ? columns.map(c => `[${c}]`).join(', ') : '*';
        let query = `SELECT ${selectCols} FROM [${tableName}] WHERE 1=1`;

        // 3. 安全參數化引數
        Object.keys(filters).forEach((key, index) => {
            const paramName = `p${index}`;
            request.input(paramName, filters[key]);
            query += ` AND [${key}] = @${paramName}`;
        });

        console.log(`[QUERY] Executing generic query on ${tableName}`);
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Generic Query Failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// Move AI endpoint here or keep it below middleware
app.post('/api/generate-recommendations', async (req, res) => {
    try {
        if (!geminiKey) {
            return res.status(500).json({ error: 'Gemini API Key missing in SQLDB.txt' });
        }

        const clinicalData = req.body;
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `你是一位講求實證醫學 的資深臨床營養師。請根據下列真實的臨床數據，撰寫一份營養評估與介入報告。
        
        【個案臨床數據總表】
        ${JSON.stringify(clinicalData, null, 2)}

        【嚴格寫作規範 (Strict Rules)】
        1. **拒絕幻覺**: 報告中提到的每一個狀況，都必須有數據支持。
        2. **強制數據引用**: 在每一句建議結尾標註依據，例如: [蛋白質攝取: 45%], [CC: 29cm]。
        3. **格式要求**: 請依照以下 JSON 格式輸出：
           { "title": "...", "dataSummary": "...", "recommendations": ["...", "..."] }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json(JSON.parse(text));
    } catch (err) {
        console.error('AI Generation Failed:', err);
        res.status(500).json({ error: err.message });
    }
});
const port = 3002;

// Middleware moved to top

app.get('/api/patients', async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(503).json({ error: '資料庫未連線，請檢查內網 VPN。' });
        }
        const request = pool.request();
        
        // Joined query to get Name from Base Table and Date from View
        const query = `
            SELECT 
                TRIM(v.[身分證字號]) as id, 
                p.[姓名] as name, 
                v.[日期] as assessment_date
            FROM vw_營養系統_迷你營養評估_BI報表 v
            LEFT JOIN 基本資料_個案 p ON TRIM(v.身分證字號) = TRIM(p.身分證字號)
            WHERE v.[身分證字號] IS NOT NULL
            ORDER BY v.[日期] DESC, p.[姓名] ASC
        `;

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching patient list:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/nutrition-data', async (req, res) => {
    try {
        const { id_no, start_date, end_date } = req.query;
        const pool = await poolPromise;
        if (!pool) {
            return res.status(503).json({ error: '資料庫未連線，請檢查內網 VPN。' });
        }
        const request = pool.request();

        let query = `SELECT * FROM vw_營養系統_迷你營養評估_BI報表 WHERE 1=1`;
        console.log(`Querying nutrition data for ID: ${id_no}, Range: ${start_date} to ${end_date}`);

        if (id_no) {
            request.input('id_no', mssql.NVarChar, id_no.trim());
            query += ` AND TRIM(身分證字號) = @id_no`;
        }

        if (start_date) {
            request.input('start_date', mssql.Date, start_date);
            query += ` AND 日期 >= @start_date`;
        }

        if (end_date) {
            request.input('end_date', mssql.Date, end_date);
            query += ` AND 日期 <= @end_date`;
        }

        query += ` ORDER BY 日期 DESC`;

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching nutrition data:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/latest-date', async (req, res) => {
    try {
        const { id_no } = req.query;
        const pool = await poolPromise;
        if (!pool) return res.status(503).json({ error: '資料庫未連線' });
        
        const request = pool.request();
        request.input('id_no', mssql.NVarChar, id_no.trim());
        const query = `SELECT MAX(日期) as latest FROM vw_營養系統_迷你營養評估_BI報表 WHERE TRIM(身分證字號) = @id_no`;
        const result = await request.query(query);
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`BI Dashboard Server running at http://localhost:${port}`);
});
