# Gemini 2.5 Pro Integration

This document explains the integration of the new Gemini 2.5 Pro model into the NeurOS project.

## Overview

We've successfully integrated the **Gemini 2.5 Pro (Preview)** model using Google's new unified GenAI SDK (`@google/genai`). This provides access to the latest Gemini model with enhanced capabilities.

## What's Been Added

### 1. Dependencies
- **@google/genai**: The new Google GenAI SDK for unified access to Gemini models

### 2. Configuration Updates

#### `src/config/keys.ts`
Added new model configuration:
```typescript
gemini25: {
  displayName: 'Gemini 2.5 Pro (Preview)',
  apiName: 'gemini-2.5-pro-preview-05-06',
  temperature: 0.7,
  maxTokens: 800,
  useNewSDK: true // Flag to indicate this uses the new Google GenAI SDK
}
```

### 3. AI Provider Implementation

#### `src/utils/ai-providers.ts`
- Added `callGemini25API()` function using the new Google GenAI SDK
- Updated `callAIProvider()` to support `gemini25` provider
- Updated `getAvailableModels()` to include the new model

### 4. UI Updates

#### `src/components/neuro/AdminPanel.tsx`
Added new option in the AI provider selector:
```tsx
<SelectItem value="gemini25" className="text-xs ui-select-item">
  🟢 Gemini 2.5 Pro (Preview)
</SelectItem>
```

#### `src/hooks/useLearningSession.ts`
- Added `gemini25` to valid providers list
- Added display name for the new model

### 5. Testing Infrastructure

#### New API Routes
- **`/api/test-gemini25`**: Dedicated test endpoint for Gemini 2.5 Pro
- Updated **`/api/test-providers`**: Includes Gemini 2.5 Pro in provider tests

#### Test Files
- **`src/test-gemini25.js`**: Standalone test script for the new model

## Usage

### Setting as Default Provider

1. Open the Admin Panel in the NeurOS interface
2. Go to "System Settings" section
3. Select "🟢 Gemini 2.5 Pro (Preview)" from the AI Provider dropdown
4. The setting will be saved automatically

### API Usage

The new model is automatically available through all existing AI endpoints when `gemini25` is set as the provider:

- `/api/multi-dialogue`
- `/api/reading-dialogue`
- `/api/ai/generate`
- `/api/ai/generateWithCharacter`

### Direct Testing

Use the test endpoint to verify the integration:

```bash
curl -X POST http://localhost:3000/api/test-gemini25 \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, Gemini 2.5 Pro!"}'
```

## Key Features of Gemini 2.5 Pro

- **Enhanced reasoning capabilities**
- **Improved context understanding**
- **Better code generation**
- **Advanced multimodal understanding**
- **Streamlined API through unified SDK**

## Environment Setup

Ensure you have the `GOOGLE_AI_API_KEY` environment variable set:

```bash
export GOOGLE_AI_API_KEY="your-api-key-here"
```

## Code Examples

### Basic Usage
```typescript
import { callGemini25API } from '@/utils/ai-providers';

const response = await callGemini25API("Explain quantum computing");
console.log(response.text);
```

### Using the New SDK Directly
```typescript
import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

const response = await client.models.generateContent({
  model: 'gemini-2.5-pro-preview-05-06',
  contents: 'What are the benefits of the new Gemini 2.5 Pro model?',
});

console.log(response.text);
```

## Migration Notes

- The integration maintains backward compatibility with existing Gemini 1.5 Pro
- Users can switch between models seamlessly through the UI
- The new SDK is used only for Gemini 2.5 Pro; existing models continue using their current implementations

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure `GOOGLE_AI_API_KEY` is properly set
2. **Model Availability**: The model is in preview and may have usage limits
3. **Import Errors**: Ensure `@google/genai` is properly installed

### Testing the Integration

1. Run the test endpoint: `POST /api/test-gemini25`
2. Check the provider test: `GET /api/test-providers`
3. Use the Admin Panel to switch providers and test responses

## Future Enhancements

- Support for additional Gemini 2.x models as they become available
- Integration of new features like multimodal inputs/outputs
- Performance optimizations using the unified SDK

## Dependencies

```json
{
  "@google/genai": "^1.0.1"
}
```

---

The Gemini 2.5 Pro integration is now complete and ready for use! The model can be selected through the Admin Panel and will be used for all AI interactions in the NeurOS system. 