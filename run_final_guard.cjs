const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const homedir = os.homedir();
const guardPath = path.join(homedir, '.gemini', 'antigravity', 'neuron-sync', 'omega-reflection-guard.js');

try {
    execSync(`node "${guardPath}"`, { stdio: 'inherit' });
    console.log('Final Guard PASS!');
} catch (e) {
    console.error('Final Guard FAILED:', e.message);
}
