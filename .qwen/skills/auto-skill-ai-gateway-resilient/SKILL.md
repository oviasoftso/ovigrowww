---
name: ai-gateway-resilient
description: Implement resilient AI gateway with fallback mechanisms to prevent API errors
source: auto-skill
extracted_at: '2026-06-23T09:08:14.183Z'
---

## Approach

1. **Create Robust AI Gateway Service**:
   - Implement fallback mechanisms between multiple AI providers
   - Add retry logic with exponential backoff for transient failures
   - Handle common API errors (401, 402, 420, 429, 500, 503) gracefully

2. **Implement Multi-Provider Support**:
   - Primary: OpenRouter (paid models)
   - Fallback 1: Pollinations (free models)
   - Fallback 2: Hermes (free models)
   - Automatic model mapping between providers

3. **Add Intelligent Model Fallback Hierarchy**:
   - Define fallback chains for each primary model
   - Automatically try alternative models when primary fails
   - Support both paid and free model alternatives

4. **Enhance Error Handling**:
   - Custom error types for different failure modes
   - Distinguish between retryable and non-retryable errors
   - Provide meaningful error messages to users

5. **Update UI Components**:
   - Modify AIChat component to use enhanced gateway
   - Show provider information in model selector
   - Improve error messaging for better UX

## Implementation Steps

1. **Create AI Gateway Service** (`src/lib/ai-gateway.ts`):
   - Implement `enhancedChatCompletion` and `enhancedStreamChatCompletion` functions
   - Add retry logic with exponential backoff
   - Create provider-specific implementations (OpenRouter, Pollinations, Hermes)
   - Add comprehensive error handling and classification

2. **Update OpenRouter Service** (`src/lib/openrouter.ts`):
   - Export FREE_MODELS constant for free model mappings
   - Add FreeModelKey type for type safety

3. **Modify AIChat Component** (`src/pages/AIChat.tsx`):
   - Import enhanced gateway functions instead of direct OpenRouter calls
   - Update model options to include both paid and free models
   - Show provider badges in model selector
   - Improve error messages to indicate fallback attempts
   - Update model value mapping for mixed provider types

4. **Update Vite Configuration** (`vite.config.ts`):
   - Add runtime caching for new AI provider endpoints
   - Configure Workbox to cache Pollinations and Hermes APIs

5. **Test Implementation**:
   - Verify normal operation with primary models
   - Test fallback behavior by simulating API failures
   - Confirm proper error handling and user messaging
   - Validate build and development server functionality

## Key Files Modified

- `src/lib/ai-gateway.ts` - New resilient AI gateway service
- `src/lib/openrouter.ts` - Enhanced with free model exports
- `src/pages/AIChat.tsx` - Updated to use gateway and show provider info
- `vite.config.ts` - Added caching for new API endpoints

## Error Handling Features

- **Authentication Errors (401)**: Handled as non-retryable, clear messaging
- **Rate Limit Errors (402, 420, 429)**: Treated as retryable with backoff
- **Server Errors (500, 503)**: Treated as retryable with exponential backoff
- **Network Errors**: Automatically retried with backoff
- **Model Errors**: Trigger fallback to alternative models

## Fallback Strategy

1. Try primary model (e.g., Claude Sonnet 4 via OpenRouter)
2. If fails, try fallback models (Llama 3.1 70B, Llama 3.1 8B, Mixtral 8x7B)
3. If all OpenRouter models fail, try equivalent free models via Pollinations
4. If all else fails, provide informative error message to user

This approach ensures the AI chat functionality remains available even when individual service providers experience issues, providing a seamless user experience.