# TCG Collection

Web para ver la colección de cartas de Charmander/Charmeleon, exportada de Notion (base de datos "Cartas"). Solo incluye las cartas sin dibujo repetido que tengo o quiero.

## Uso

```bash
npm install
npm run dev
```

- Los datos viven en `src/data/cards.json` (exportados de Notion).
- El botón **"La tengo"** de cada carta persiste el cambio directamente en `cards.json` (solo con `npm run dev`).
- Cada carta enlaza a su página de Cardmarket.

## Imágenes

Las imágenes viven en `public/cards/<id>.jpg` (ya descargadas y commiteadas). Para re-descargarlas:

```bash
node scripts/download_images.mjs
```

Usa `scripts/image-map.json` (id de carta → URL en el CDN de Cardmarket) con un Referer de cardmarket.com, que es lo único que exige su CDN. Es resumible: salta las que ya existen.

Ojo: las páginas de producto de Cardmarket están detrás de Cloudflare y no se pueden scrapear con clientes headless (curl/cloudscraper reciben 403). Si se añaden cartas nuevas, el `image-map.json` hay que regenerarlo desde un navegador real (fetch same-origin del og:image desde una pestaña de cardmarket.com). Las cartas sin imagen muestran un placeholder.
