import { createServer } from 'node:http'
import { distExists, handleApiRequest, serveStaticAsset } from './service.mjs'

const port = Number(process.env.PORT || 3000)

const server = createServer(async (request, response) => {
  try {
    const handled = await handleApiRequest(request, response)
    if (handled) return

    if (!distExists()) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Build output not found. Run `npm run build` first.')
      return
    }

    serveStaticAsset(request, response)
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ error: error.message || 'Internal server error' }))
  }
})

server.listen(port, () => {
  console.log(`App server listening on http://localhost:${port}`)
})
