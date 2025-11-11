import { config } from 'dotenv';
config({ path: '.env.local' });

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log('API Key:', apiKey ? apiKey.substring(0, 15) + '...' : 'NOT FOUND');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

console.log('Calling Gemini API...');
const result = await model.generateContent("Say hello in Indonesian");
const response = await result.response;
console.log('Response:', response.text());
