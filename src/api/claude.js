import { appConfig, getConfigError } from '../config'

const TRIVAGO_MCP = {
  type: 'url',
  url: 'https://mcp.trivago.com/mcp',
  name: 'trivago',
}

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const ANTHROPIC_BETA = 'mcp-client-2025-04-04'

async function callClaude({ messages, mcpServers = [], systemPrompt = null, maxTokens = 1000 }) {
  const configError = getConfigError()
  if (configError) {
    throw new Error(configError)
  }

  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages,
  }

  if (systemPrompt) body.system = systemPrompt
  if (mcpServers.length > 0) body.mcp_servers = mcpServers

  const resp = await fetch(ANTHROPIC_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': appConfig.anthropicApiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-beta': ANTHROPIC_BETA,
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Anthropic API error ${resp.status}`)
  }

  return resp.json()
}

function extractTextFromResponse(data) {
  return data.content
    ?.filter((item) => item.type === 'text')
    .map((item) => item.text)
    .join('\n') || ''
}

function extractMcpResultFromResponse(data) {
  return data.content
    ?.filter((item) => item.type === 'mcp_tool_result')
    .map((item) => item.content?.[0]?.text || '')
    .join('\n') || ''
}

function parseJsonArray(raw) {
  const clean = raw.replace(/```json|```/g, '').trim()
  const start = clean.indexOf('[')
  const end = clean.lastIndexOf(']')

  if (start === -1 || end === -1) return null

  try {
    return JSON.parse(clean.slice(start, end + 1))
  } catch {
    return null
  }
}

function sanitizeHotel(hotel) {
  return {
    name: hotel?.name || 'Unnamed hotel',
    area: hotel?.area || 'Area not specified',
    pricePerNight: Math.max(0, Math.round(Number(hotel?.pricePerNight) || 0)),
    stars: Math.min(5, Math.max(1, Math.round(Number(hotel?.stars) || 3))),
    rating: Math.min(10, Math.max(0, Number(hotel?.rating) || 0)),
    highlights: hotel?.highlights || 'Well-located stay option.',
  }
}

function fallbackHotels(city) {
  return [
    {
      name: `Central ${city} Hotel`,
      area: 'City Centre',
      pricePerNight: 115,
      stars: 4,
      rating: 8.1,
      highlights: 'Great central location, modern rooms',
    },
    {
      name: `${city} Boutique Suites`,
      area: 'Old Town',
      pricePerNight: 88,
      stars: 3,
      rating: 7.9,
      highlights: 'Charming decor, close to attractions',
    },
    {
      name: `Grand ${city} Resort`,
      area: 'Riverside',
      pricePerNight: 210,
      stars: 5,
      rating: 9.2,
      highlights: 'Spa, rooftop pool, fine dining',
    },
  ]
}

export async function searchHotelsForDestination({ city, checkin, checkout, nights, adults, rooms }) {
  if (appConfig.useMockData) {
    return {
      hotels: fallbackHotels(city),
      source: 'fallback',
      warning: 'Mock mode is enabled, so these hotel results are demo data.',
    }
  }

  const prompt = `Use trivago to search for accommodations in ${city} from ${checkin} to ${checkout} for ${adults} adult(s) and ${rooms} room(s).

Return the top 3 results as a raw JSON array (no markdown, no explanation) with this exact shape:
[
  {
    "name": "Hotel Name",
    "area": "Neighbourhood or district",
    "pricePerNight": 120,
    "stars": 4,
    "rating": 8.2,
    "highlights": "Short 1-line description of key selling point"
  }
]

Only return the JSON array. Nothing else.`

  try {
    const data = await callClaude({
      messages: [{ role: 'user', content: prompt }],
      mcpServers: [TRIVAGO_MCP],
    })
    const mcpRaw = extractMcpResultFromResponse(data)
    const textRaw = extractTextFromResponse(data)
    const raw = mcpRaw || textRaw
    const parsed = parseJsonArray(raw)

    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      return {
        hotels: parsed.map(sanitizeHotel),
        source: 'live',
        warning: '',
      }
    }

    throw new Error('The hotel response could not be parsed.')
  } catch (error) {
    console.warn(`trivago MCP search failed for ${city}:`, error.message)

    return {
      hotels: fallbackHotels(city),
      source: 'fallback',
      warning: `Live hotel search was unavailable for ${city}, so demo fallback results are shown instead.`,
      error: error.message,
    }
  }
}

export async function generateTravelBrief(selections) {
  if (appConfig.useMockData) {
    return {
      text: null,
      source: 'fallback',
      warning: 'Mock mode is enabled, so the AI travel brief is disabled.',
      error: '',
    }
  }

  const lines = selections
    .map((selection) => `- ${selection.city}: ${selection.hotel.name} in ${selection.hotel.area} (${selection.nights} nights, check-in ${selection.checkin})`)
    .join('\n')

  const prompt = `Write a concise, friendly travel brief (200 words max) for this multi-city trip:

${lines}

Structure it as:
1. A one-line opener about the overall trip vibe
2. For each city: 2 must-do activities specific to that destination
3. One practical tip about moving between these cities
4. One thing travellers often overlook

Keep the tone warm and practical. No headers, just flowing paragraphs.`

  try {
    const data = await callClaude({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 600,
    })

    return {
      text: extractTextFromResponse(data) || null,
      source: 'live',
      warning: '',
      error: '',
    }
  } catch (error) {
    console.warn('Travel brief generation failed:', error.message)

    return {
      text: null,
      source: 'fallback',
      warning: 'The AI travel brief is unavailable right now, so a local summary is shown instead.',
      error: error.message,
    }
  }
}
