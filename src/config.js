const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY?.trim()

export const appConfig = {
  anthropicApiKey: apiKey,
  hasAnthropicKey: Boolean(apiKey && apiKey !== 'your_anthropic_api_key_here'),
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
}

export function getConfigError() {
  if (!appConfig.hasAnthropicKey && !appConfig.useMockData) {
    return 'Missing VITE_ANTHROPIC_API_KEY. Add a real key to `.env` or enable `VITE_USE_MOCK_DATA=true` for local demo mode.'
  }

  return ''
}
