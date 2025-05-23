// Test script for Gemini 2.5 Pro integration
// To run this code you need to install the following dependencies:
// npm install @google/genai

import { GoogleGenAI } from '@google/genai';

async function testGemini25() {
    try {
        const client = new GoogleGenAI({
            apiKey: process.env.GOOGLE_AI_API_KEY || 'your-api-key-here',
        });

        const model = "gemini-2.5-pro-preview-05-06";
        
        console.log("Testing Gemini 2.5 Pro streaming response...");
        
        for await (const chunk of client.models.generateContentStream({
            model: model,
            contents: "Hello! Can you tell me about the latest AI developments?",
            config: {
                temperature: 0.7,
                maxOutputTokens: 800,
                topP: 0.8,
                topK: 40
            }
        })) {
            process.stdout.write(chunk.text || '');
        }
        
        console.log("\n\nStreaming test completed!");
        
    } catch (error) {
        console.error("Error testing Gemini 2.5 Pro:", error);
    }
}

// Alternative simplified test
async function testGemini25Simple() {
    try {
        const client = new GoogleGenAI({
            apiKey: process.env.GOOGLE_AI_API_KEY || 'your-api-key-here',
        });

        console.log("Testing Gemini 2.5 Pro simple response...");
        
        const response = await client.models.generateContent({
            model: "gemini-2.5-pro-preview-05-06",
            contents: "What are the key features of Gemini 2.5 Pro?",
        });

        console.log("Response:", response.text);
        
    } catch (error) {
        console.error("Error in simple test:", error);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    console.log("Running Gemini 2.5 Pro tests...");
    await testGemini25Simple();
    await testGemini25();
}

export { testGemini25, testGemini25Simple }; 