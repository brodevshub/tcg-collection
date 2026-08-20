import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const CARDS_JSON = fileURLToPath(new URL('./src/data/cards.json', import.meta.url))
const CARDS_IMG_DIR = fileURLToPath(new URL('./public/cards', import.meta.url))

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
            const { id, laTengo } = JSON.parse(body) as { id: string; laTengo: boolean }
            const cards = JSON.parse(readFileSync(CARDS_JSON, 'utf-8')) as { id: string; laTengo: boolean }[]
            const card = cards.find((c) => c.id === id)
            if (!card) {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'card not found' }))
              return
            }
            // Se asigna el valor pedido (no toggle ciego): así cliente y disco
            // no pueden quedar invertidos si algún POST se pierde
            card.laTengo = laTengo === true
            writeFileSync(CARDS_JSON, JSON.stringify(cards, null, 2) + '\n')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ id, laTengo: card.laTengo }))
          } catch {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'bad request' }))
          }
        })
      })

      // Devuelve cards.json leído del disco. El import estático del bundle
      // queda cacheado por Vite (cards.json está excluido del watcher), así
      // que el front se sincroniza con esto al arrancar.
      server.middlewares.use('/api/cards', (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end()
          return
        }
        res.setHeader('Content-Type', 'application/json')
        res.end(readFileSync(CARDS_JSON, 'utf-8'))
      })

      // Alterna un idioma en "idiomasQueTengo" de una carta y lo persiste.
      server.middlewares.use('/api/toggle-idioma', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          try {
            const { id, idioma, tengo } = JSON.parse(body) as {
              id: string
              idioma: string
              tengo: boolean
            }
            const cards = JSON.parse(readFileSync(CARDS_JSON, 'utf-8')) as {
              id: string
              idiomasDisponibles: string[]
              idiomasQueTengo: string[]
            }[]
            const card = cards.find((c) => c.id === id)
            if (!card || !card.idiomasDisponibles.includes(idioma)) {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'card o idioma no válido' }))
              return
            }
            // Se asigna el valor pedido (no toggle ciego), ver toggle-tengo
            card.idiomasQueTengo = card.idiomasDisponibles.filter((f) =>
              f === idioma ? tengo === true : card.idiomasQueTengo.includes(f),
            )
            writeFileSync(CARDS_JSON, JSON.stringify(cards, null, 2) + '\n')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ id, idiomasQueTengo: card.idiomasQueTengo }))
          } catch {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'bad request' }))
          }
        })
      })

      // Descarga la imagen de una carta. El navegador (en cardmarket.com) extrae
      // la URL og:image y la manda aquí; el servidor baja el JPEG con Referer de
      // Cardmarket, que es lo que exige su CDN. CORS abierto porque el POST
      // llega desde páginas de cardmarket.com.
      server.middlewares.use('/api/fetch-image', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        // Chrome exige esto (Private Network Access) para llamadas de una web
        // pública https hacia localhost
        res.setHeader('Access-Control-Allow-Private-Network', 'true')
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json')
          try {
            const { productUrl, imageUrl } = JSON.parse(body) as { productUrl: string; imageUrl: string }
            if (!/^https:\/\/product-images\.s3\.cardmarket\.com\//.test(imageUrl)) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'bad imageUrl' }))
              return
            }
            const cards = JSON.parse(readFileSync(CARDS_JSON, 'utf-8')) as { id: string; cardmarketUrl: string }[]
            const ids = cards.filter((c) => c.cardmarketUrl === productUrl).map((c) => c.id)
            if (ids.length === 0) {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'unknown productUrl', productUrl }))
              return
            }
            const imgRes = await fetch(imageUrl, {
              headers: {
                Referer: 'https://www.cardmarket.com/',
                'User-Agent':
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
              },
            })
            if (!imgRes.ok) {
              res.statusCode = 502
              res.end(JSON.stringify({ error: `image HTTP ${imgRes.status}` }))
              return
            }
            const buffer = Buffer.from(await imgRes.arrayBuffer())
            mkdirSync(CARDS_IMG_DIR, { recursive: true })
            for (const id of ids) writeFileSync(`${CARDS_IMG_DIR}/${id}.jpg`, buffer)
            res.end(JSON.stringify({ ids, bytes: buffer.length }))
          } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(error) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), persistCards()],
  server: {
    // El endpoint del toggle reescribe cards.json; sin esto cada toggle
    // recargaría la página. public/cards NO se ignora: Vite necesita ver los
    // archivos nuevos para servirlos.
    watch: { ignored: ['**/src/data/cards.json'] },
  },
})
