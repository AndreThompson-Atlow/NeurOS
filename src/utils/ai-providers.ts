import { CONFIG } from "@/config/keys";

// Common interface for all AI providers
export interface AIProviderResponse {
  text: string;
  error?: string;
}

/**
 * Call the Gemini API directly
 */
export async function callGeminiAPI(prompt: string): Promise<AIProviderResponse> {
  try {
    // Use the API key directly
    const apiKey = CONFIG.AI.googleApiKey;
    
    console.log("Using Gemini API with prompt length:", prompt.length);
    
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
        temperature: CONFIG.models.gemini.temperature,
        maxOutputTokens: CONFIG.models.gemini.maxTokens,
        topP: 0.8,
        topK: 40
      }
    };
    
    // Make a direct HTTP request to the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.models.gemini.apiName}:generateContent?key=${apiKey}`,
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
      return {
        text: "",
        error: `API error (${response.status}): ${errorText.substring(0, 100)}...`
      };
    }
    
    const data = await response.json();
    console.log("Gemini API response received");
    
    // Extract the response text
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    return {
      text: textResponse
    };
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return {
      text: "",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Call the OpenAI API directly
 */
export async function callOpenAIAPI(prompt: string): Promise<AIProviderResponse> {
  try {
    // Use the API key directly
    const apiKey = CONFIG.AI.openaiApiKey;
    
    console.log("Using OpenAI API with prompt length:", prompt.length);
    
    // Prepare the request payload according to OpenAI's API docs
    const payload = {
      model: CONFIG.models.openai.apiName,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: CONFIG.models.openai.temperature,
      max_tokens: CONFIG.models.openai.maxTokens,
      top_p: 0.8
    };
    
    // Make a direct HTTP request to the OpenAI API
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return {
        text: "",
        error: `API error (${response.status}): ${errorText.substring(0, 100)}...`
      };
    }
    
    const data = await response.json();
    console.log("OpenAI API response received");
    
    // Extract the response text
    const textResponse = data.choices?.[0]?.message?.content || "";
    
    return {
      text: textResponse
    };
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    return {
      text: "",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Call the Claude API directly
 */
export async function callClaudeAPI(prompt: string): Promise<AIProviderResponse> {
  try {
    // Use the API key directly
    const apiKey = CONFIG.AI.claudeApiKey;
    
    console.log("Using Claude API with prompt length:", prompt.length);
    
    // Prepare the request payload according to Anthropic's API docs
    const payload = {
      model: CONFIG.models.claude.apiName,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: CONFIG.models.claude.temperature,
      max_tokens: CONFIG.models.claude.maxTokens,
      top_p: 0.8
    };
    
    // Make a direct HTTP request to the Claude API
    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", response.status, errorText);
      return {
        text: "",
        error: `API error (${response.status}): ${errorText.substring(0, 100)}...`
      };
    }
    
    const data = await response.json();
    console.log("Claude API response received");
    
    // Extract the response text
    const textResponse = data.content?.[0]?.text || "";
    
    return {
      text: textResponse
    };
  } catch (error) {
    console.error("Claude API call failed:", error);
    return {
      text: "",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Call any configured AI provider 
 */
export async function callAIProvider(prompt: string, provider?: string): Promise<AIProviderResponse> {
  // Use specified provider or default from config
  const selectedProvider = provider || CONFIG.AI.provider;
  
  console.log(`Using AI provider: ${selectedProvider}`);
  
  // Call the appropriate provider
  switch (selectedProvider) {
    case 'openai':
      return callOpenAIAPI(prompt);
    case 'claude':
      return callClaudeAPI(prompt);
    case 'gemini':
    default:
      return callGeminiAPI(prompt);
  }
} 