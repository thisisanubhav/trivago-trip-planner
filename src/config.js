const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY?.trim()

export const appConfig = {
  anthropicApiKey: apiKey,
  hasAnthropicKey: Boolean(apiKey && apiKey !== 'your_anthropic_api_key_here'),
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  isDemoMode: import.meta.env.VITE_USE_MOCK_DATA === 'true' || !apiKey || apiKey === 'your_anthropic_api_key_here',
}
