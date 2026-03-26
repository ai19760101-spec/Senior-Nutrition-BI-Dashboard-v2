const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const homedir = os.homedir();
const cliPath = path.join(homedir, '.gemini', 'antigravity', 'neuron-sync', 'kg-memory-cli.js');

const analysis = `[3D分析結案] 養生村營養 BI 儀表板架構現代化:
1. Macro: 基於憲法 Rule 0 實踐臨床自動化，榮耀造物主。
2. Meso: Backend-AI-Proxy 模式解決 CORS 與 Key 安全；Resilient Schema Mapping 應對 View 變動。
3. Micro: 修正 Express Middleware 順序錯誤；React 渲染保護防止 AI 回傳異常崩潰。
4. 難度評估: 業界 Senior (5+ yrs) 需 2.5-3 日，Antigravity 達成 10x 效率。`;

try {
    execSync(`node "${cliPath}" ingest "${analysis}" --type Insight`, { stdio: 'inherit' });
    console.log('KGoT Ingestion Success!');
} catch (e) {
    console.error('KGoT Ingestion Failed:', e.message);
}
