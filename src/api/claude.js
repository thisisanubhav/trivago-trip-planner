const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

const TRIVAGO_MCP = {
  type: 'url',
  url: 'https://mcp.trivago.com/mcp',
  name: 'trivago',
}

async function callClaude({ messages, mcpServers = [], systemPrompt = null, maxTokens = 1000 }) {
  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages,
  }
  if (systemPrompt) body.system = systemPrompt
  if (mcpServers.length > 0) body.mcp_servers = mcpServers

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${resp.status}`)
  }

  return resp.json()
}

function extractTextFromResponse(data) {
  return data.content
    ?.filter((x) => x.type === 'text')
    .map((x) => x.text)
    .join('\n') || ''
}

function extractMcpResultFromResponse(data) {
  return data.content
    ?.filter((x) => x.type === 'mcp_tool_result')
    .map((x) => x.content?.[0]?.text || '')
    .join('\n') || ''
}

function parseJsonArray(raw) {
  const clean = raw.replace(/```json|```/g, '').trim()
  const start = clean.indexOf('[')
  const end = clean.lastIndexOf(']')
  if (start === -1 || end === -1) return null
  return JSON.parse(clean.slice(start, end + 1))
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
      highlights: 'Charming décor, close to attractions',
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
    if (parsed && Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch (e) {
    console.warn(`trivago MCP search failed for ${city}:`, e.message)
  }

  return fallbackHotels(city)
}

export async function generateTravelBrief(selections) {
  const lines = selections
    .map((s) => `- ${s.city}: ${s.hotel.name} in ${s.hotel.area} (${s.nights} nights, check-in ${s.checkin})`)
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
    return extractTextFromResponse(data) || null
  } catch (e) {
    console.warn('Travel brief generation failed:', e.message)
    return null
  }
}
