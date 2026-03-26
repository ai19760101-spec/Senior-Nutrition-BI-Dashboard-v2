const { execSync } = require('child_process');

try {
    console.log('Cleaning up Node/Vite processes...');
    // Kill processes on Windows
    execSync('taskkill /F /IM node.exe /T', { stdio: 'ignore' });
} catch (e) {
    // Ignore errors if no processes found
}
console.log('Cleanup complete.');
