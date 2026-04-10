require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
console.log('KEY_EXISTS:', !!process.env.GEMINI_API_KEY);
console.log('KEY_PREFIX:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) : 'NULL');
