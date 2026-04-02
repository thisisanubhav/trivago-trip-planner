import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const viteBin = join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js')
const apiServer = join(rootDir, 'server', 'apiServer.mjs')

function startProcess(label, args, extraEnv = {}) {
  const child = spawn(process.execPath, args, {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  })

  child.on('exit', (code) => {
    if (code !== 0) {
      console.log(`${label} exited with code ${code}`)
      shutdown(code || 1)
    }
  })

  return child
}

const children = [
  startProcess('api', [apiServer], { API_PORT: process.env.API_PORT || '3001' }),
  startProcess('vite', [viteBin]),
]

let shuttingDown = false

function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }

  setTimeout(() => process.exit(code), 200)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
