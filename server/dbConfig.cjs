const mssql = require('mssql');
const fs = require('fs');
const path = require('path');

// Parse SQLDB.txt
const configPath = path.join(__dirname, '../data/SQLDB.txt');
const configContent = fs.readFileSync(configPath, 'utf8');

const configMap = {};
configContent.split('\n').forEach(line => {
    const [key, value] = line.split(':');
    if (key && value) {
        configMap[key.trim()] = value.trim();
    }
});

const dbConfig = {
    user: configMap['帳號'],
    password: configMap['密碼'],
    server: configMap['伺服器名稱'], // Corrected from SQLServerIP
    database: configMap['資料庫'],     // Corrected from DB
    options: {
        encrypt: false, // Changed to false for better local/on-prem compatibility
        trustServerCertificate: true 
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const poolPromise = new mssql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed! Please check if VPN is connected.');
        return null; // Return null instead of throwing to prevent crash
    });

const geminiKey = configMap['API Key'];

module.exports = {
    mssql,
    poolPromise,
    geminiKey
};
