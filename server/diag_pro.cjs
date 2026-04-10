const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Try the original 'gemini-pro' which is the base of v1
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent('ping');
        console.log('SUCCESS: Gemini Pro replied!');
        console.log('Output:', (await result.response).text());
    } catch (err) {
        console.log('FAILED:', err.message);
    }
}
test();
