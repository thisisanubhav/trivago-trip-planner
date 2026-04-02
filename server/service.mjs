import { existsSync, readFileSync, createReadStream } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const ROOT_DIR = process.cwd()
const DIST_DIR = join(ROOT_DIR, 'dist')
const ENV_PATH = join(ROOT_DIR, '.env')
const TRIVAGO_MCP = {
  type: 'url',
  url: 'https://mcp.trivago.com/mcp',
  name: 'trivago',
}
const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const ANTHROPIC_BETA = 'mcp-client-2025-04-04'
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
}

function loadEnvFile() {
  if (!existsSync(ENV_PATH)) return

  const source = readFileSync(ENV_PATH, 'utf8')

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) continue

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvFile()

function getServerConfig() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim() || process.env.VITE_ANTHROPIC_API_KEY?.trim() || ''
  const placeholderValues = new Set([
    '',
    'your_anthropic_api_key_here',
    'your_real_key_here',
    'your_real_claude_key_here',
  ])
  const hasRealApiKey = Boolean(apiKey) && !placeholderValues.has(apiKey)

  return {
    anthropicApiKey: apiKey,
    hasAnthropicKey: hasRealApiKey,
    useMockData: process.env.VITE_USE_MOCK_DATA === 'true',
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload))
}

async function readJsonBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) return {}

  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

async function callClaude({ messages, mcpServers = [], maxTokens = 1000 }) {
  const serverConfig = getServerConfig()
  if (!serverConfig.hasAnthropicKey) {
    throw new Error('Missing Anthropic API key on the server')
  }

  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages,
  }

  if (mcpServers.length > 0) {
    body.mcp_servers = mcpServers
  }

  const response = await fetch(ANTHROPIC_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': serverConfig.anthropicApiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-beta': ANTHROPIC_BETA,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}))
    throw new Error(errorPayload?.error?.message || `Anthropic API error ${response.status}`)
  }

  return response.json()
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

async function searchHotelsForDestination({ city, checkin, checkout, adults, rooms }) {
  const serverConfig = getServerConfig()

  if (serverConfig.useMockData || !serverConfig.hasAnthropicKey) {
    return {
      hotels: fallbackHotels(city),
      source: 'fallback',
      warning: serverConfig.useMockData
        ? 'Mock mode is enabled on the server, so these hotel results are demo data.'
        : 'No Anthropic API key was configured on the server, so demo hotel results are being shown.',
      error: '',
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
    const raw = extractMcpResultFromResponse(data) || extractTextFromResponse(data)
    const parsed = parseJsonArray(raw)

    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('The hotel response could not be parsed.')
    }

    return {
      hotels: parsed.map(sanitizeHotel),
      source: 'live',
      warning: '',
      error: '',
    }
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

async function generateTravelBrief(selections) {
  const serverConfig = getServerConfig()

  if (serverConfig.useMockData || !serverConfig.hasAnthropicKey) {
    return {
      text: null,
      source: 'fallback',
      warning: serverConfig.useMockData
        ? 'Mock mode is enabled on the server, so the AI travel brief is disabled.'
        : 'No Anthropic API key was configured on the server, so the AI travel brief is unavailable.',
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

export async function handleApiRequest(request, response) {
  if (request.method === 'OPTIONS') {
    sendJson(response, 200, { ok: true })
    return true
  }

  const url = new URL(request.url, 'http://localhost')

  if (request.method === 'GET' && url.pathname === '/api/health') {
    const serverConfig = getServerConfig()
    sendJson(response, 200, {
      ok: true,
      hasAnthropicKey: serverConfig.hasAnthropicKey,
      useMockData: serverConfig.useMockData,
    })
    return true
  }

  if (request.method === 'POST' && url.pathname === '/api/search-hotels') {
    const payload = await readJsonBody(request)

    if (!payload?.city || !payload?.checkin || !payload?.checkout) {
      sendJson(response, 400, { error: 'city, checkin, and checkout are required.' })
      return true
    }

    const result = await searchHotelsForDestination(payload)
    sendJson(response, 200, result)
    return true
  }

  if (request.method === 'POST' && url.pathname === '/api/travel-brief') {
    const payload = await readJsonBody(request)
    const selections = Array.isArray(payload?.selections) ? payload.selections : []
    const result = await generateTravelBrief(selections)
    sendJson(response, 200, result)
    return true
  }

  return false
}

export function serveStaticAsset(request, response) {
  const url = new URL(request.url, 'http://localhost')
  let requestedPath = url.pathname === '/' ? '/index.html' : url.pathname

  if (!extname(requestedPath)) {
    requestedPath = '/index.html'
  }

  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, '')
  const filePath = join(DIST_DIR, safePath)

  if (!existsSync(filePath)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
    return
  }

  response.writeHead(200, {
    'Content-Type': MIME_TYPES[extname(filePath)] || 'application/octet-stream',
  })

  createReadStream(filePath).pipe(response)
}

export function distExists() {
  return existsSync(join(DIST_DIR, 'index.html'))
}
