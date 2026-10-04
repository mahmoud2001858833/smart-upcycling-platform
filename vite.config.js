import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { handleAction } from './supabase/functions/_shared/openrouterCore.js'

/**
 * Dev-only AI gateway.
 * Serves POST /api/ai using the same core as the Supabase Edge Function, reading
 * OPENROUTER_API_KEY from .env.local (NOT prefixed with VITE_, so it is never bundled).
 */
function aiGatewayDev(env) {
  const handler = async (req, res, next) => {
    if (!req.url?.startsWith('/api/ai')) return next()
    const send = (status, body) => {
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(body))
    }
    if (req.method !== 'POST') return send(405, { success: false, error: 'POST only' })

    let raw = ''
    for await (const chunk of req) raw += chunk
    try {
      const { action, payload } = JSON.parse(raw || '{}')
      const result = await handleAction({ action, payload, apiKey: env.OPENROUTER_API_KEY, env })
      send(200, result)
    } catch (e) {
      send(500, { success: false, error: e.message || 'خطأ غير متوقع' })
    }
  }
  return {
    name: 'ai-gateway-dev',
    configureServer(server) { server.middlewares.use(handler) },
    configurePreviewServer(server) { server.middlewares.use(handler) }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [tailwindcss(), react(), aiGatewayDev(env)],
    server: {
      port: 3000,
      host: true
    },
    preview: {
      port: 3000,
      host: true
    }
  }
})
