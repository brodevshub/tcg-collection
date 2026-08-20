import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const CARDS_JSON = fileURLToPath(new URL('./src/data/cards.json', import.meta.url))

// Persiste el toggle de "La tengo" escribiendo directamente en src/data/cards.json.
// Solo existe en `npm run dev`; en un build estático el endpoint no está disponible.
function persistCards(): Plugin {
  return {
    name: 'persist-cards',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/toggle-tengo', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          try {
            const { id } = JSON.parse(body) as { id: string }
            const cards = JSON.parse(readFileSync(CARDS_JSON, 'utf-8')) as { id: string; laTengo: boolean }[]
            const card = cards.find((c) => c.id === id)
            if (!card) {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'card not found' }))
              return
            }
            card.laTengo = !card.laTengo
            writeFileSync(CARDS_JSON, JSON.stringify(cards, null, 2) + '\n')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ id, laTengo: card.laTengo }))
          } catch {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'bad request' }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), persistCards()],
  server: {
    // El endpoint reescribe cards.json; sin esto cada toggle recargaría la página
    watch: { ignored: ['**/src/data/cards.json'] },
  },
})
