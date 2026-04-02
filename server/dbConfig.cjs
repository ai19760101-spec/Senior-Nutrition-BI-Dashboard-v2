const mssql = require('mssql');
const fs = require('fs');
const path = require('path');

// Parse SQLDB.txt (local fallback)
const configPath = path.join(__dirname, '../data/SQLDB.txt');
let configMap = {};
try {
    if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        configContent.split('\n').forEach(line => {
            const [key, value] = line.split(':');
            if (key && value) {
                configMap[key.trim()] = value.trim();
            }
        });
    }
} catch (e) {
    console.warn('Local SQLDB.txt not found, using environment variables.');
}

const dbConfig = {
    user: process.env.SQL_USER || configMap['帳號'],
    password: process.env.SQL_PASSWORD || configMap['密碼'],
    server: process.env.SQL_SERVER || configMap['伺服器名稱'],
    database: process.env.SQL_DATABASE || configMap['資料庫'],
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

const geminiKey = process.env.GEMINI_API_KEY || configMap['API Key'];
module.exports = {
    mssql,
    poolPromise,
    geminiKey
};
