import { NextResponse } from 'next/server';
import { CONFIG } from '@/config/keys';

// Simple direct API implementation using fetch
export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const prompt = requestData.prompt || "Hello, world";
    
    // Use the API key directly
    const apiKey = CONFIG.AI.googleApiKey;
    
    console.log("Using direct Gemini API with key length:", apiKey.length);
    
    // Prepare the request payload according to Google's API docs
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.8,
        topK: 40
      }
    };
    
    // Make a direct HTTP request to the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json({
        success: false,
        error: `API error: ${response.status} - ${errorText.substring(0, 100)}...`,
        status: response.status
      });
    }
    
    const data = await response.json();
    console.log("Gemini API response received:", !!data);
    
    // Format the response similar to our existing structure
    const formattedResponse = {
      dialogue: [
        {
          characterId: "gemini",
          message: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text"
        }
      ],
      originalResponse: data
    };
    
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Direct API call failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 