import { CONFIG } from "@/config/keys";

// Common interface for all AI providers
export interface AIProviderResponse {
  text: string;
  error?: string;
}

/**
 * Call the new Gemini 2.5 Pro API using the Google GenAI SDK
 */
export async function callGemini25API(prompt: string): Promise<AIProviderResponse> {
  try {
    // Dynamic import to avoid bundling issues
    const { GoogleGenAI } = await import('@google/genai');
    
    const apiKey = CONFIG.AI.googleApiKey;
    console.log("Using Gemini 2.5 Pro API with prompt length:", prompt.length);
    
    // Initialize the new Google GenAI client
    const ai = new GoogleGenAI({ apiKey });
    
    // Generate content using the new SDK
    const response = await ai.models.generateContent({
      model: CONFIG.models.gemini25.apiName,
      contents: prompt,
      config: {
        temperature: CONFIG.models.gemini25.temperature,
        maxOutputTokens: CONFIG.models.gemini25.maxTokens,
        topP: 0.8,
        topK: 40
      }
    });
    
    console.log("Gemini 2.5 Pro API response received");
    
    // Extract the response text
    const textResponse = response.text || "";
    
    return {
      text: textResponse
    };
  } catch (error) {
    console.error("Gemini 2.5 Pro API call failed:", error);
    return {
      text: "",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
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
      `https://generativelanguage.googleapis.com/v1/models/${CONFIG.models.gemini.apiName}:generateContent?key=${apiKey}`,
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
export async function callOpenAIAPI(prompt: string, modelKey?: string): Promise<AIProviderResponse> {
  try {
    // Use the API key directly
    const apiKey = CONFIG.AI.openaiApiKey;
    
    // Get model config based on modelKey or use default
    const modelConfig = modelKey && CONFIG.models[modelKey as keyof typeof CONFIG.models] 
      ? CONFIG.models[modelKey as keyof typeof CONFIG.models] 
      : CONFIG.models.openai;
    
    console.log("Using OpenAI API with model:", modelConfig.displayName, "prompt length:", prompt.length);
    
    // Prepare the request payload according to OpenAI's API docs
    const payload = {
      model: modelConfig.apiName,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
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
export async function callClaudeAPI(prompt: string, modelKey?: string): Promise<AIProviderResponse> {
  try {
    // Use the API key directly
    const apiKey = CONFIG.AI.claudeApiKey;
    
    // Get model config based on modelKey or use default
    let modelConfig = CONFIG.models.claude; // Default
    
    if (modelKey) {
      switch (modelKey) {
        case 'claudeOpus4':
          modelConfig = CONFIG.models.claudeOpus4;
          break;
        case 'claudeSonnet4':
        case 'claude4':
          modelConfig = CONFIG.models.claudeSonnet4;
          break;
        case 'claudeSonnet37':
        case 'claude37':
          modelConfig = CONFIG.models.claudeSonnet37;
          break;
        case 'claude':
        default:
          modelConfig = CONFIG.models.claude;
          break;
      }
    }
    
    console.log("Using Claude API with model:", modelConfig.displayName, "prompt length:", prompt.length);
    
    // Prepare the request payload according to Anthropic's API docs
    const payload = {
      model: modelConfig.apiName,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
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
export async function callAIProvider(prompt: string, provider?: string, modelKey?: string): Promise<AIProviderResponse> {
  // Use specified provider, or try to get from learning state (if available in browser), or default from config
  let selectedProvider = provider || CONFIG.AI.provider;
  
  // Try to get user-selected provider from localStorage if we're in the browser
  if (!provider && typeof window !== 'undefined') {
    try {
      const learningStateJSON = localStorage.getItem('neuroosV2LearningState_v0_1_3');
      if (learningStateJSON) {
        const learningState = JSON.parse(learningStateJSON);
        if (learningState?.aiProvider) {
          selectedProvider = learningState.aiProvider;
        }
      }
    } catch (error) {
      console.error("Error accessing user AI provider preference:", error);
    }
  }
  
  console.log(`Using AI provider: ${selectedProvider}${modelKey ? ` with model: ${modelKey}` : ''}`);
  
  // Call the appropriate provider
  switch (selectedProvider) {
    case 'gemini25':
      return callGemini25API(prompt);
    case 'openai':
      return callOpenAIAPI(prompt, modelKey);
    case 'claude':
    case 'claude4':
    case 'claude37':
      return callClaudeAPI(prompt, modelKey || selectedProvider);
    case 'gemini':
    default:
      return callGeminiAPI(prompt);
  }
}

/**
 * Get available models for each provider
 */
export function getAvailableModels(): { [provider: string]: { key: string, name: string, model: string }[] } {
  return {
    gemini: [
      { key: 'gemini', name: CONFIG.models.gemini.displayName, model: CONFIG.models.gemini.apiName },
      { key: 'gemini25', name: CONFIG.models.gemini25.displayName, model: CONFIG.models.gemini25.apiName }
    ],
    openai: [
      { key: 'openai', name: CONFIG.models.openai.displayName, model: CONFIG.models.openai.apiName }
    ],
    claude: [
      { key: 'claude', name: CONFIG.models.claude.displayName, model: CONFIG.models.claude.apiName },
      { key: 'claudeSonnet37', name: CONFIG.models.claudeSonnet37.displayName, model: CONFIG.models.claudeSonnet37.apiName },
      { key: 'claudeSonnet4', name: CONFIG.models.claudeSonnet4.displayName, model: CONFIG.models.claudeSonnet4.apiName },
      { key: 'claudeOpus4', name: CONFIG.models.claudeOpus4.displayName, model: CONFIG.models.claudeOpus4.apiName }
    ]
  };
} 