/**
 * GEMINI API RETRY UTILITY
 * Handles 503 overload errors with exponential backoff and model fallback
 */

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is a 503 overload error
 */
function isOverloadError(error) {
  const errorMsg = error?.message || error?.toString() || '';
  return (
    errorMsg.includes('503') ||
    errorMsg.includes('overloaded') ||
    errorMsg.includes('RESOURCE_EXHAUSTED') ||
    errorMsg.includes('quota')
  );
}

/**
 * Check if error is a rate limit error
 */
function isRateLimitError(error) {
  const errorMsg = error?.message || error?.toString() || '';
  return (
    errorMsg.includes('429') ||
    errorMsg.includes('rate limit') ||
    errorMsg.includes('Too Many Requests')
  );
}

/**
 * Exponential backoff retry wrapper for Gemini API calls
 *
 * @param {Function} apiCall - Async function that makes the Gemini API call
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Array<string>} options.fallbackModels - Alternative models to try if primary fails
 * @param {Function} options.onRetry - Callback function called before each retry
 * @returns {Promise} - Result from successful API call
 */
export async function retryWithBackoff(apiCall, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    fallbackModels = [],
    onRetry = null,
  } = options;

  let lastError = null;
  let currentModel = null;

  // Try with primary model first, then fallback models
  const modelsToTry = [null, ...fallbackModels]; // null = use original model

  for (let modelIndex = 0; modelIndex < modelsToTry.length; modelIndex++) {
    currentModel = modelsToTry[modelIndex];

    if (currentModel) {
      console.log(`[Gemini Retry] Trying fallback model: ${currentModel}`);
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Call the API with the current model (if fallback is specified)
        const result = currentModel
          ? await apiCall(currentModel)
          : await apiCall();

        // Success!
        if (attempt > 0) {
          console.log(`[Gemini Retry] ✅ Success after ${attempt} retries`);
        }
        return result;

      } catch (error) {
        lastError = error;
        const isOverload = isOverloadError(error);
        const isRateLimit = isRateLimitError(error);

        // If it's not an overload/rate limit error, don't retry
        if (!isOverload && !isRateLimit) {
          console.error('[Gemini Retry] Non-retryable error:', error.message);
          throw error;
        }

        // If this is the last retry for this model, try next model
        if (attempt === maxRetries) {
          console.warn(`[Gemini Retry] Max retries (${maxRetries}) reached for model ${currentModel || 'primary'}`);
          break; // Move to next model
        }

        // Calculate delay with exponential backoff and jitter
        const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        const jitter = Math.random() * 1000; // Add random jitter to prevent thundering herd
        const delay = exponentialDelay + jitter;

        console.warn(
          `[Gemini Retry] ⚠️ ${isOverload ? 'Overload' : 'Rate limit'} error (attempt ${attempt + 1}/${maxRetries + 1}). ` +
          `Retrying in ${Math.round(delay)}ms...`
        );

        // Call onRetry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, maxRetries + 1, delay, error);
        }

        // Wait before retrying
        await sleep(delay);
      }
    }
  }

  // All retries and fallback models exhausted
  console.error('[Gemini Retry] ❌ All retry attempts and fallback models exhausted');
  throw lastError;
}

/**
 * Wrapper for Gemini generateContent with automatic retry
 *
 * @param {Object} model - Gemini model instance
 * @param {string} prompt - Prompt to send
 * @param {Object} options - Retry options (same as retryWithBackoff)
 * @returns {Promise} - Gemini response
 */
export async function generateContentWithRetry(model, prompt, options = {}) {
  return retryWithBackoff(
    async (fallbackModelName) => {
      // If fallback model is provided, we need to create a new model instance
      // This is a bit tricky since we need access to the genAI instance
      // For now, we'll just use the original model
      // TODO: Pass genAI instance to allow model switching

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response;
    },
    {
      maxRetries: 3,
      baseDelay: 2000, // Start with 2 seconds
      maxDelay: 15000, // Max 15 seconds
      ...options,
    }
  );
}

/**
 * Wrapper for Gemini chat with automatic retry
 *
 * @param {Object} chat - Gemini chat instance
 * @param {string} message - Message to send
 * @param {Object} options - Retry options
 * @returns {Promise} - Gemini response
 */
export async function sendMessageWithRetry(chat, message, options = {}) {
  return retryWithBackoff(
    async () => {
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response;
    },
    {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 15000,
      ...options,
    }
  );
}

/**
 * Create a rate-limited queue for Gemini API calls
 * Prevents overwhelming the API with too many simultaneous requests
 */
export class GeminiRateLimiter {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 3; // Max 3 concurrent requests
    this.minDelay = options.minDelay || 500; // Min 500ms between requests
    this.queue = [];
    this.active = 0;
    this.lastCallTime = 0;
  }

  /**
   * Execute an API call with rate limiting
   */
  async execute(apiCall) {
    return new Promise((resolve, reject) => {
      this.queue.push({ apiCall, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    // If we're at max concurrent requests, wait
    if (this.active >= this.maxConcurrent) {
      return;
    }

    // If queue is empty, nothing to do
    if (this.queue.length === 0) {
      return;
    }

    // Enforce minimum delay between requests
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    if (timeSinceLastCall < this.minDelay) {
      setTimeout(() => this.processQueue(), this.minDelay - timeSinceLastCall);
      return;
    }

    // Get next item from queue
    const { apiCall, resolve, reject } = this.queue.shift();
    this.active++;
    this.lastCallTime = Date.now();

    try {
      const result = await apiCall();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.active--;
      // Process next item in queue
      this.processQueue();
    }
  }
}

// Global rate limiter instance
let globalRateLimiter = null;

/**
 * Get or create global rate limiter
 */
export function getGlobalRateLimiter() {
  if (!globalRateLimiter) {
    globalRateLimiter = new GeminiRateLimiter({
      maxConcurrent: 3,
      minDelay: 500,
    });
  }
  return globalRateLimiter;
}

/**
 * Execute API call with both rate limiting and retry logic
 */
export async function executeWithRateLimitAndRetry(apiCall, retryOptions = {}) {
  const rateLimiter = getGlobalRateLimiter();

  return rateLimiter.execute(async () => {
    return retryWithBackoff(apiCall, retryOptions);
  });
}

export default {
  retryWithBackoff,
  generateContentWithRetry,
  sendMessageWithRetry,
  GeminiRateLimiter,
  getGlobalRateLimiter,
  executeWithRateLimitAndRetry,
};
