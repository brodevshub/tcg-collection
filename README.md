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

```bash
pip install cloudscraper beautifulsoup4
python3 scripts/download_images.py
```

Descarga las imágenes desde Cardmarket a `public/cards/<id>.jpg`. Es resumible: si Cloudflare bloquea alguna, relanza el script y reintenta solo las que faltan. Las cartas sin imagen muestran un placeholder.
