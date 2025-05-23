import { NextResponse } from 'next/server';
import { callAIProvider, getAvailableModels } from '@/utils/ai-providers';

export async function GET() {
  try {
    const testPrompt = "Please respond with just the word: SUCCESS";
    
    // Test each provider
    const results = {
      gemini: null as any,
      gemini25: null as any,
      openai: null as any,
      claude: null as any,
      claudeSonnet4: null as any,
      claudeOpus4: null as any,
      claudeSonnet37: null as any,
      availableModels: getAvailableModels(),
      timestamp: new Date().toISOString()
    };
    
    // Test Gemini
    try {
      const geminiResult = await callAIProvider(testPrompt, 'gemini');
      results.gemini = {
        success: !geminiResult.error,
        response: geminiResult.text?.substring(0, 100),
        error: geminiResult.error
      };
    } catch (error) {
      results.gemini = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Test Gemini 2.5 Pro
    try {
      const gemini25Result = await callAIProvider(testPrompt, 'gemini25');
      results.gemini25 = {
        success: !gemini25Result.error,
        response: gemini25Result.text?.substring(0, 100),
        error: gemini25Result.error
      };
    } catch (error) {
      results.gemini25 = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Test OpenAI
    try {
      const openaiResult = await callAIProvider(testPrompt, 'openai');
      results.openai = {
        success: !openaiResult.error,
        response: openaiResult.text?.substring(0, 100),
        error: openaiResult.error
      };
    } catch (error) {
      results.openai = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Test Claude 3.5 Sonnet (default)
    try {
      const claudeResult = await callAIProvider(testPrompt, 'claude', 'claude');
      results.claude = {
        success: !claudeResult.error,
        response: claudeResult.text?.substring(0, 100),
        error: claudeResult.error
      };
    } catch (error) {
      results.claude = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Test Claude 4 Sonnet
    try {
      const claude4Result = await callAIProvider(testPrompt, 'claude', 'claudeSonnet4');
      results.claudeSonnet4 = {
        success: !claude4Result.error,
        response: claude4Result.text?.substring(0, 100),
        error: claude4Result.error
      };
    } catch (error) {
      results.claudeSonnet4 = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Test Claude 4 Opus
    try {
      const claudeOpusResult = await callAIProvider(testPrompt, 'claude', 'claudeOpus4');
      results.claudeOpus4 = {
        success: !claudeOpusResult.error,
        response: claudeOpusResult.text?.substring(0, 100),
        error: claudeOpusResult.error
      };
    } catch (error) {
      results.claudeOpus4 = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Test Claude 3.7 Sonnet
    try {
      const claude37Result = await callAIProvider(testPrompt, 'claude', 'claudeSonnet37');
      results.claudeSonnet37 = {
        success: !claude37Result.error,
        response: claude37Result.text?.substring(0, 100),
        error: claude37Result.error
      };
    } catch (error) {
      results.claudeSonnet37 = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error("Provider test failed:", error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
} 