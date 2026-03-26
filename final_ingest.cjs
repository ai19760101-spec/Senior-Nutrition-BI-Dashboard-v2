const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const homedir = os.homedir();
const cliPath = path.join(homedir, '.gemini', 'antigravity', 'neuron-sync', 'kg-memory-cli.js');

const experiences = [
    "SQL-BI Modernization requires a Backend-AI-Proxy to securely handle Gemini API keys and bypass CORS.",
    "Express middleware like express.json() must be defined before routes to populate req.body.",
    "Smart Date-Sync: Linking search modal selection to date-range state enables zero-click clinical data visualization.",
    "Using fuzzy keys matching for SQL column detection ensures dashboard stability against View schema changes."
];

try {
    for (const exp of experiences) {
        execSync(`node "${cliPath}" ingest "${exp}" --type Experience`, { stdio: 'inherit' });
    }
    console.log('All Experience Ingested!');
} catch (e) {
    console.error('KGoT Ingestion Failed:', e.message);
}
