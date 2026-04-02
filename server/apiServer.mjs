import { createServer } from 'node:http'
import { handleApiRequest } from './service.mjs'

const port = Number(process.env.API_PORT || 3001)

const server = createServer(async (request, response) => {
  try {
    const handled = await handleApiRequest(request, response)

    if (!handled) {
      response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
      response.end(JSON.stringify({ error: 'Not found' }))
    }
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ error: error.message || 'Internal server error' }))
  }
})

server.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
