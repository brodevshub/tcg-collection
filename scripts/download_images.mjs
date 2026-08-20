// Descarga las imágenes de las cartas a public/cards/<id>.jpg usando el mapa
// scripts/image-map.json (id -> URL en el CDN de Cardmarket). El CDN exige un
// Referer de cardmarket.com; con esa cabecera basta, no hay challenge de
// Cloudflare como en las páginas de producto.
//
// Resumible: salta las imágenes que ya existen.
//
// Uso: node scripts/download_images.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const map = JSON.parse(readFileSync(`${ROOT}/scripts/image-map.json`, 'utf-8'))
const outDir = `${ROOT}/public/cards`
mkdirSync(outDir, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let done = 0
let skipped = 0
const failed = []

for (const [id, url] of Object.entries(map)) {
  const outPath = `${outDir}/${id}.jpg`
  if (existsSync(outPath)) {
    skipped++
    continue
  }
  try {
    const res = await fetch(url, {
      headers: {
        Referer: 'https://www.cardmarket.com/',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length < 1000) throw new Error(`respuesta sospechosa (${buffer.length} bytes)`)
    writeFileSync(outPath, buffer)
    done++
    console.log(`[${done + skipped}/${Object.keys(map).length}] ${id}`)
  } catch (error) {
    failed.push(`${id}: ${error}`)
  }
  await sleep(400)
}

console.log(`\nDescargadas: ${done} · Ya existían: ${skipped} · Fallidas: ${failed.length}`)
if (failed.length) {
  console.log(failed.join('\n'))
  process.exitCode = 1
}
