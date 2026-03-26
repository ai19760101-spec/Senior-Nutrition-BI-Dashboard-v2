const { poolPromise } = require('./server/dbConfig.cjs');

async function inspect() {
    try {
        const pool = await poolPromise;
        if (!pool) {
            console.error('DB Not Connected');
            return;
        }
        const result = await pool.request().query('SELECT TOP 1 * FROM vw_營養系統_迷你營養評估_BI報表');
        if (result.recordset.length > 0) {
            console.log('--- Column Names detected in View ---');
            console.log(Object.keys(result.recordset[0]));
            
            console.log('\n--- Sample Data ---');
            console.log(result.recordset[0]);
        } else {
            console.log('View is empty.');
        }

        // Specifically check for the user's ID
        const userResult = await pool.request().query("SELECT * FROM vw_營養系統_迷你營養評估_BI報表 WHERE 身分證字號 = 'A121064970'");
        console.log('\n--- Records for A121064970 ---');
        console.log(userResult.recordset.length, 'records found.');
        if (userResult.recordset.length > 0) {
            console.log(userResult.recordset[0]);
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

inspect();
