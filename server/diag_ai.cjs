const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('Testing gemini-1.5-flash...');
        const result = await model.generateContent('ping');
        console.log('SUCCESS: Gemini 1.5 replied!');
        console.log('Output:', (await result.response).text());
    } catch (err) {
        console.error('FAILED:', err.message);
    }
}
test();
