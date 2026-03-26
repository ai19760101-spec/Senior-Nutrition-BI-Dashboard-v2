const express = require('express');
const cors = require('cors');
const { mssql, poolPromise } = require('./dbConfig');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/nutrition-data', async (req, res) => {
    try {
        const { id_no, start_date, end_date } = req.query;
        const pool = await poolPromise;
        const request = pool.request();

        let query = `SELECT * FROM vw_營養系統_迷你營養評估_BI報表 WHERE 1=1`;

        if (id_no) {
            request.input('id_no', mssql.NVarChar, id_no);
            query += ` AND 身分證字號 = @id_no`;
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
        
        // Ensure returning column names match CSV template for the frontend
        // Note: The mapping is assumed to be direct based on user feedback.
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching nutrition data:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
