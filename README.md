# Rastro traceability page

Static page that follows each coffee lot from the farm to the cup on an interactive
Leaflet map, with brewing tools and base recipes. It is the destination of the QR printed on
each RASTRO bag. Page copy is in Spanish (customer-facing). Data comes from rastrotienda.cl
(lots, roast dates, producer, importer, roaster).

Visual system: see `DESIGN.md` ("Estela de luz", a wake of light on a blush haze).
Product context: `PRODUCT.md`.

## Run

    npm run serve        # node tools/serve.mjs (no cache) -> http://localhost:8080
    npm test             # node:test: data, pure helpers, trail, recipes and WCAG contrast of the tokens

ES modules need an HTTP server; opening `index.html` through `file://` will not work.
Each lot has its own address: `#lote-3`, `#lote-3-1`, `#lote-3-5` (use these for the QR codes).

## Replace the illustrative route

Every stop in `js/data.js` with `verified: false` is a placeholder (shown as
"ubicación por confirmar", with a dotted leg). For each real stop set `place`, `lat`, `lng`,
`date` (ISO or `null`) and `verified: true`. A leg is drawn as a solid line once both of its
stops are verified. Only the farm location and the roast dates are real today.

## Effects

The footprints and falling coffee beans exist only on the map (`js/fx/trailLayer.js`, with
the path math in `js/trail.js`). The rest of the page uses a proximity glow on buttons, tabs
and links, a tilt on the bag, scroll reveals, and an eased glide to the sections (`js/fx/scroll.js`). All of them stop under `prefers-reduced-motion`.

## Assets and credits

- Brand art is built from code: `node design-src/build.mjs` writes `assets/brand/logo-mark.svg`,
  `disc-beans.svg`, `favicon.png`, `assets/rastro_bag_hd.webp` and `assets/og.jpg`. It needs
  Playwright and sharp (set `PLAYWRIGHT_MODULES` and `SHARP_MODULES` to their `node_modules`
  folders if they are not installed here). The bag is an illustration, not a photo of the real pouch.
- `assets/brand/` also holds images taken from the rastrotienda.cl media library (farm, importer,
  roaster, vessels).
- `assets/gear/`: brewing tool photos from Wikimedia Commons, cut out from their background.
  Authors and licenses are listed in `js/credits.js` and in the page footer. Most are
  CC BY-SA, so keep the credits when you change or redistribute them.
- Fonts: Sora and Hanken Grotesk (SIL Open Font License), self-hosted in `assets/fonts/`.
- Map tiles: Esri Light Gray Canvas, Hillshade and Reference layers, no API key. Check
  Esri's terms before using the page commercially. Leaflet loads from a CDN; without it the
  timeline still shows the whole route.
- Recipes are generic base recipes, not the roaster's own.
