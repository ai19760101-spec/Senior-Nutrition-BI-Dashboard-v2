const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function list() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // SDK method for listing models
        // Note: genAI.listModels is not a standard method in current SDK, 
        // usually we just try known ones.
        // Let's try 'gemini-1.5-flash' again but verify the code.
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('ping');
        console.log('SUCCESS with gemini-1.5-flash');
    } catch (err) {
        console.log('List Attempt Result:', err.message);
    }
}
list();
