import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { handleRequest } from './supabase/functions/_shared/gateway.js'

/**
 * Dev-only AI gateway.
 * Serves POST /api/ai with the very same handler as the Supabase Edge Function (capacity, credit,
 * caps, usage log, admin). Secrets come from .env.local and are NOT prefixed with VITE_, so they
 * are never bundled. Without SUPABASE_SERVICE_ROLE_KEY the usage log lives in memory.
 */
function aiGatewayDev(env) {
  const gatewayEnv = {
    ...env,
    SUPABASE_URL: env.SUPABASE_URL || env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY,
    EXPOSE_ERRORS: env.EXPOSE_ERRORS ?? '1'
  }
  const MAX_BODY = 4_000_000

  const handler = async (req, res, next) => {
    if (!req.url?.startsWith('/api/ai')) return next()
    const send = (status, body) => {
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(body))
    }
    if (req.method !== 'POST') return send(405, { success: false, error: 'POST only' })

    let raw = ''
    for await (const chunk of req) {
      raw += chunk
      if (raw.length > MAX_BODY) return send(413, { success: false, code: 'TOO_LARGE', error: 'الطلب كبير جداً' })
    }
    let body
    try {
      body = JSON.parse(raw || '{}')
    } catch {
      return send(400, { success: false, code: 'BAD_REQUEST', error: 'طلب غير صالح' })
    }
    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim()
    const { status, body: out } = await handleRequest({ body, headers: req.headers, ip, env: gatewayEnv })
    send(status, out)
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
