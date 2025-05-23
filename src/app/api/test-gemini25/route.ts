import { NextResponse } from 'next/server';
import { callGemini25API } from '@/utils/ai-providers';

export async function POST(request: Request) {
  try {
    const { prompt = "Hello, test the new Gemini 2.5 Pro model!" } = await request.json();
    
    console.log('🧪 [GEMINI-2.5-TEST] Testing new Gemini 2.5 Pro model...');
    
    const aiResponse = await callGemini25API(prompt);
    
    if (aiResponse.error) {
      console.error("Gemini 2.5 Pro error:", aiResponse.error);
      return NextResponse.json({
        success: false,
        error: aiResponse.error,
        model: "gemini-2.5-pro-preview-05-06"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      response: aiResponse.text,
      model: "gemini-2.5-pro-preview-05-06",
      prompt: prompt
    });
    
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      model: "gemini-2.5-pro-preview-05-06"
    }, { status: 500 });
  }
} 