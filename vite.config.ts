import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Headers enviados no servidor de desenvolvimento
const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

// CSP injetado apenas no build de produção (funciona em qualquer hosting,
// incluindo GitHub Pages, que não permite headers HTTP personalizados).
function securityPlugin(): Plugin {
  let isBuild = false

  return {
    name: 'gavetas-security',
    configResolved(config) {
      isBuild = config.command === 'build'
    },
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        for (const [name, value] of Object.entries(securityHeaders)) {
          res.setHeader(name, value)
        }
        next()
      })
    },
    transformIndexHtml(html) {
      if (!isBuild) return html

      const csp = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "connect-src 'self' https://atjsosdryvdfpdsmukio.supabase.co",
        "frame-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')

      const meta =
        `<meta http-equiv="Content-Security-Policy" content="${csp}" />` +
        `<meta name="referrer" content="strict-origin-when-cross-origin" />`

      const headIndex = html.indexOf('<head>')
      if (headIndex === -1) return html
      return html.slice(0, headIndex + 6) + meta + html.slice(headIndex + 6)
    },
  }
}

export default defineConfig({
  plugins: [react(), securityPlugin()],
})