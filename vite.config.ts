import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

function stratzDevProxy(key: string): Plugin {
  return {
    name: 'vantage-stratz-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/stratz', (req, res) => {
        const send = (status: number, payload: unknown) => {
          res.statusCode = status
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(payload))
        }

        if (req.method !== 'POST') return send(405, { errors: [{ message: 'Only POST' }] })
        if (!key) {
          return send(500, {
            errors: [{ message: 'STRATZ_API_KEY не найден. Проверьте файл .env.local' }],
          })
        }

        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8')
          fetch('https://api.stratz.com/graphql', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              authorization: `Bearer ${key}`,
              'user-agent': 'STRATZ_API',
            },
            body,
          })
            .then(async (upstream) => send(upstream.status, await upstream.json()))
            .catch((error: unknown) =>
              send(502, { errors: [{ message: `Stratz недоступен: ${String(error)}` }] }),
            )
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), stratzDevProxy(env.STRATZ_API_KEY ?? '')],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'es2022',
    },
  }
})
