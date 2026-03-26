const express = require('express');
const cors = require('cors');
const { mssql, poolPromise } = require('./dbConfig.cjs');

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

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
    console.log(`Server running at http://localhost:${port}`);
});
