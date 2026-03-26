const { poolPromise } = require('./server/dbConfig.cjs');

async function inspect() {
    try {
        const pool = await poolPromise;
        if (!pool) return;

        console.log('--- Columns in vw_營養系統_迷你營養評估_BI報表 ---');
        const viewCols = await pool.request().query("SELECT TOP 0 * FROM vw_營養系統_迷你營養評估_BI報表");
        console.log(Object.keys(viewCols.recordset.columns));

        console.log('\n--- Columns in 基本資料_個案 ---');
        try {
            const tableCols = await pool.request().query("SELECT TOP 0 * FROM 基本資料_個案");
            console.log(Object.keys(tableCols.recordset.columns));
        } catch (e) {
            console.log('Could not access 基本資料_個案:', e.message);
        }

        console.log('\n--- Sample records with potential ID matching ---');
        const sample = await pool.request().query("SELECT TOP 5 * FROM vw_營養系統_迷你營養評估_BI報表");
        console.log(sample.recordset);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

inspect();
