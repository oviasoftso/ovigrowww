import { ChatMessage, ChatCompletionRequest, ChatCompletionResponse, AI_MODELS, AIModelKey } from './openrouter'

// Free AI model providers
const FREE_PROVIDERS = {
  HERMES: 'https://hermes.pollinations.ai',
  POLLINATIONS: 'https://text.pollinations.ai',
  OPENROUTER_FREE: 'https://openrouter.ai/api/v1',
} as const

// Free models mapping
const FREE_MODELS = {
  'llama-3.1-8b': 'meta-llama/llama-3.1-8b-instruct',
  'llama-3.1-70b': 'meta-llama/llama-3.1-70b-instruct',
  'gemma-2-9b': 'google/gemma-2-9b-it',
  'mistral-7b': 'mistralai/mistral-7b-instruct',
  'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct',
  'command-r': 'cohere/command-r',
  'command-r-plus': 'cohere/command-r-plus',
} as const

type FreeModelKey = keyof typeof FREE_MODELS

// Fallback model hierarchy
const MODEL_FALLBACKS: Record<AIModelKey, FreeModelKey[]> = {
  'claude-sonnet-4': ['llama-3.1-70b', 'llama-3.1-8b', 'mixtral-8x7b'],
  'claude-haiku': ['llama-3.1-8b', 'mistral-7b', 'gemma-2-9b'],
  'gpt-4.1': ['llama-3.1-70b', 'mixtral-8x7b', 'command-r-plus'],
  'gpt-4.1-mini': ['llama-3.1-8b', 'mistral-7b', 'gemma-2-9b'],
  'gemini-pro': ['llama-3.1-70b', 'mixtral-8x7b', 'command-r-plus'],
  'gemini-flash': ['llama-3.1-8b', 'mistral-7b', 'gemma-2-9b'],
}

// Error handling and retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Custom error types
class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message)
    this.name = 'AIError'
  }
}

class RateLimitError extends AIError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT')
    this.name = 'RateLimitError'
  }
}

class AuthenticationError extends AIError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION')
    this.name = 'AuthenticationError'
  }
}

class ModelError extends AIError {
  constructor(message: string) {
    super(message, 'MODEL_ERROR')
    this.name = 'ModelError'
  }
}

// Utility function to delay execution
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Function to get provider URL based on model
function getProviderUrl(model: string): string {
  // Check if it's a free model
  if (Object.values(FREE_MODELS).includes(model as any)) {
    // For now, we'll use Pollinations for all free models
    // In a more advanced implementation, we could route based on model type
    return FREE_PROVIDERS.POLLINATIONS
  }
  
  // Default to OpenRouter for paid models
  return FREE_PROVIDERS.OPENROUTER_FREE
}

// Enhanced chat completion with fallback and error handling
export async function enhancedChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const originalModel = request.model || AI_MODELS['claude-sonnet-4']
  const fallbackModels = getModelFallbacks(originalModel as any)
  
  // Try original model first
  try {
    return await attemptChatCompletion(request)
  } catch (error) {
    console.warn(`Failed to use model ${originalModel}:`, error)
    
    // Try fallback models
    for (const fallbackModel of fallbackModels) {
      try {
        const fallbackRequest = {
          ...request,
          model: FREE_MODELS[fallbackModel]
        }
        return await attemptChatCompletion(fallbackRequest)
      } catch (fallbackError) {
        console.warn(`Failed to use fallback model ${fallbackModel}:`, fallbackError)
        // Continue to next fallback
      }
    }
    
    // If all models fail, throw the original error
    throw error
  }
}

// Enhanced streaming chat completion with fallback and error handling
export async function enhancedStreamChatCompletion(
  request: ChatCompletionRequest,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  const originalModel = request.model || AI_MODELS['claude-sonnet-4']
  const fallbackModels = getModelFallbacks(originalModel as any)
  
  // Try original model first
  try {
    return await attemptStreamChatCompletion(request, onChunk, onComplete, onError)
  } catch (error) {
    console.warn(`Failed to use model ${originalModel}:`, error)
    
    // Try fallback models
    for (const fallbackModel of fallbackModels) {
      try {
        const fallbackRequest = {
          ...request,
          model: FREE_MODELS[fallbackModel]
        }
        return await attemptStreamChatCompletion(fallbackRequest, onChunk, onComplete, onError)
      } catch (fallbackError) {
        console.warn(`Failed to use fallback model ${fallbackModel}:`, fallbackError)
        // Continue to next fallback
      }
    }
    
    // If all models fail, call onError with the original error
    onError(error instanceof Error ? error : new Error('Unknown error'))
  }
}

// Helper function to get fallback models for a given model
function getModelFallbacks(model: string): FreeModelKey[] {
  // Find the key for the model
  const modelKey = Object.keys(AI_MODELS).find(
    key => AI_MODELS[key as AIModelKey] === model
  ) as AIModelKey | undefined
  
  if (modelKey && MODEL_FALLBACKS[modelKey]) {
    return MODEL_FALLBACKS[modelKey]
  }
  
  // Default fallbacks if model not found
  return ['llama-3.1-8b', 'mistral-7b', 'gemma-2-9b']
}

// Attempt chat completion with retry logic
async function attemptChatCompletion(
  request: ChatCompletionRequest,
  retryCount = 0
): Promise<ChatCompletionResponse> {
  try {
    const providerUrl = getProviderUrl(request.model || '')
    
    // Special handling for Pollinations API
    if (providerUrl === FREE_PROVIDERS.POLLINATIONS) {
      return await pollinationsChatCompletion(request)
    }
    
    // Special handling for Hermes API
    if (providerUrl === FREE_PROVIDERS.HERMES) {
      return await hermesChatCompletion(request)
    }
    
    // Default to OpenRouter API
    return await openRouterChatCompletion(request)
  } catch (error: any) {
    // Handle retryable errors
    if (isRetryableError(error) && retryCount < MAX_RETRIES) {
      console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES})...`)
      await delay(RETRY_DELAY * Math.pow(2, retryCount)) // Exponential backoff
      return attemptChatCompletion(request, retryCount + 1)
    }
    
    // Re-throw non-retryable errors
    throw error
  }
}

// Attempt streaming chat completion with retry logic
async function attemptStreamChatCompletion(
  request: ChatCompletionRequest,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  retryCount = 0
): Promise<void> {
  try {
    const providerUrl = getProviderUrl(request.model || '')
    
    // Special handling for Pollinations API
    if (providerUrl === FREE_PROVIDERS.POLLINATIONS) {
      return await pollinationsStreamChatCompletion(request, onChunk, onComplete, onError)
    }
    
    // Special handling for Hermes API
    if (providerUrl === FREE_PROVIDERS.HERMES) {
      return await hermesStreamChatCompletion(request, onChunk, onComplete, onError)
    }
    
    // Default to OpenRouter API
    return await openRouterStreamChatCompletion(request, onChunk, onComplete, onError)
  } catch (error: any) {
    // Handle retryable errors
    if (isRetryableError(error) && retryCount < MAX_RETRIES) {
      console.log(`Retrying streaming request (${retryCount + 1}/${MAX_RETRIES})...`)
      await delay(RETRY_DELAY * Math.pow(2, retryCount)) // Exponential backoff
      return attemptStreamChatCompletion(request, onChunk, onComplete, onError, retryCount + 1)
    }
    
    // Call onError for non-retryable errors
    onError(error instanceof Error ? error : new Error('Unknown error'))
  }
}

// OpenRouter chat completion
async function openRouterChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
  
  if (!OPENROUTER_API_KEY) {
    throw new AuthenticationError('OpenRouter API key is missing')
  }
  
  const response = await fetch(`${FREE_PROVIDERS.OPENROUTER_FREE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': import.meta.env.VITE_APP_URL || 'https://ovigrow.app',
      'X-Title': 'OviGrow AI Agricultural Intelligence',
    },
    body: JSON.stringify({
      model: request.model || 'anthropic/claude-sonnet-4',
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 2048,
      stream: false,
    }),
  })

  if (!response.ok) {
    await handleErrorResponse(response)
  }

  return response.json()
}

// OpenRouter streaming chat completion
async function openRouterStreamChatCompletion(
  request: ChatCompletionRequest,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
    
    if (!OPENROUTER_API_KEY) {
      throw new AuthenticationError('OpenRouter API key is missing')
    }
    
    const response = await fetch(`${FREE_PROVIDERS.OPENROUTER_FREE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': import.meta.env.VITE_APP_URL || 'https://ovigrow.app',
        'X-Title': 'OviGrow AI Agricultural Intelligence',
      },
      body: JSON.stringify({
        model: request.model || 'anthropic/claude-sonnet-4',
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2048,
        stream: true,
      }),
    })

    if (!response.ok) {
      await handleErrorResponse(response)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader available')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            onComplete()
            return
          }
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) onChunk(content)
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }

    onComplete()
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'))
  }
}

// Pollinations chat completion
async function pollinationsChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  // Convert messages to a single prompt for Pollinations
  const prompt = convertMessagesToPrompt(request.messages)
  
  const response = await fetch(FREE_PROVIDERS.POLLINATIONS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: prompt,
      model: request.model ? getModelName(request.model) : undefined,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
    }),
  })

  if (!response.ok) {
    await handleErrorResponse(response)
  }

  const text = await response.text()
  
  // Convert Pollinations response to OpenRouter format
  return {
    id: `pollinations-${Date.now()}`,
    choices: [
      {
        message: {
          role: 'assistant',
          content: text,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  }
}

// Pollinations streaming chat completion
async function pollinationsStreamChatCompletion(
  request: ChatCompletionRequest,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    // Convert messages to a single prompt for Pollinations
    const prompt = convertMessagesToPrompt(request.messages)
    
    const response = await fetch(FREE_PROVIDERS.POLLINATIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        model: request.model ? getModelName(request.model) : undefined,
        temperature: request.temperature,
        max_tokens: request.max_tokens,
      }),
    })

    if (!response.ok) {
      await handleErrorResponse(response)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader available')

    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value, { stream: true })
      onChunk(text)
    }

    onComplete()
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'))
  }
}

// Hermes chat completion (placeholder implementation)
async function hermesChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  // Convert messages to a single prompt for Hermes
  const prompt = convertMessagesToPrompt(request.messages)
  
  const response = await fetch(`${FREE_PROVIDERS.HERMES}/api/v1/completion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: request.model ? getModelName(request.model) : undefined,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
    }),
  })

  if (!response.ok) {
    await handleErrorResponse(response)
  }

  const text = await response.text()
  
  // Convert Hermes response to OpenRouter format
  return {
    id: `hermes-${Date.now()}`,
    choices: [
      {
        message: {
          role: 'assistant',
          content: text,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  }
}

// Hermes streaming chat completion (placeholder implementation)
async function hermesStreamChatCompletion(
  request: ChatCompletionRequest,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    // Convert messages to a single prompt for Hermes
    const prompt = convertMessagesToPrompt(request.messages)
    
    const response = await fetch(`${FREE_PROVIDERS.HERMES}/api/v1/completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: request.model ? getModelName(request.model) : undefined,
        temperature: request.temperature,
        max_tokens: request.max_tokens,
        stream: true,
      }),
    })

    if (!response.ok) {
      await handleErrorResponse(response)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader available')

    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value, { stream: true })
      onChunk(text)
    }

    onComplete()
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'))
  }
}

// Convert messages to a single prompt
function convertMessagesToPrompt(messages: ChatMessage[]): string {
  return messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')
}

// Extract model name from full model string
function getModelName(model: string): string {
  // Check if it's a free model
  const freeModelKey = Object.keys(FREE_MODELS).find(
    key => FREE_MODELS[key as FreeModelKey] === model
  )
  if (freeModelKey) {
    return freeModelKey
  }
  
  // Check if it's a paid model
  const paidModelKey = Object.keys(AI_MODELS).find(
    key => AI_MODELS[key as AIModelKey] === model
  )
  if (paidModelKey) {
    return paidModelKey
  }
  
  // Return as is if not found
  return model
}

// Handle error responses
async function handleErrorResponse(response: Response): Promise<never> {
  const errorText = await response.text()
  
  switch (response.status) {
    case 401:
      throw new AuthenticationError('Invalid API key or unauthorized access')
    case 402:
      throw new RateLimitError('Rate limit exceeded or payment required')
    case 420:
      throw new RateLimitError('Rate limit exceeded')
    case 429:
      throw new RateLimitError('Too many requests')
    case 500:
      throw new ModelError('Internal server error')
    case 503:
      throw new ModelError('Service unavailable')
    default:
      throw new AIError(
        `API error: ${response.status} - ${errorText}`,
        'API_ERROR',
        response.status
      )
  }
}

// Check if an error is retryable
function isRetryableError(error: any): boolean {
  // Retry on network errors, rate limits, and server errors
  if (error instanceof RateLimitError) {
    return true
  }
  
  if (error instanceof ModelError) {
    return true
  }
  
  if (error instanceof AIError && error.status) {
    // Retry on 5xx errors
    return error.status >= 500 && error.status < 600
  }
  
  // Retry on network errors
  if (error instanceof TypeError) {
    return true
  }
  
  return false
}

// Export types and constants
export { AI_MODELS, FREE_MODELS }
export type { AIModelKey, FreeModelKey }