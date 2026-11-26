# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- Primary: a person holding a RASTRO coffee bag who scans its QR code, usually on a phone, to learn where that exact lot came from and how it got to them. They are curious and care about origin; they are not coffee professionals.
- Secondary: a visitor on desktop who arrives from the store or a link, compares the lots, and decides which one to buy.
- Both audiences include coffee enthusiasts ("fanáticos del café") who own brewing gear (Chemex, V60, Aeropress, French press, gooseneck kettle, grinder, scale) and want good recipes.

## Product Purpose
RASTRO sells specialty coffee in small lots with traceability. This page is the destination of each bag's QR code: it follows one lot from the farm (Finca Chuquimia, Caranavi, Bolivia) through importer, roaster and dispatch to the cup, on an interactive map. Success is a visitor who trusts where the coffee came from and, secondarily, buys another bag at rastrotienda.cl.

## Positioning
Every lot can be followed. A bag is tied to a specific lot with a producer, a harvest, a roast date and a route, which a generic coffee shop page does not show.

## Operating Context
- The page is opened by scanning the QR printed on the bag, so each lot needs its own stable address (today `#lote-3`, `#lote-3-1`, `#lote-3-5`).
- Purchases happen on the existing WooCommerce store at https://rastrotienda.cl; this page links to each lot's product page and does not replicate the cart.
- Hosting target: a static host (not deployed yet, and not to be deployed until the user decides).

## Capabilities and Constraints
- Static HTML, CSS and ES modules; no build step. Leaflet loads the map from a CDN. The basemap must work without an API key.
- Three lots: Lote 3 (roast 2026-02-04), Lote 3.1 (2026-03-19), Lote 3.5 "Día del Café" (2026-09-26). Shared facts: producer Guillermo Chuquimia, Finca Chuquimia, Caranavi (La Paz), 1.600+ msnm, variety Java, washed and patio-dried (tarima), screen 16/17, harvest 2025, SCA 86, importer Kawas, roaster Ignacio Ponce of Bobo Coffee Roasters. Cup notes: cedrón, jazmín, miel.
- Prices run from $8.000 to $15.000 CLP ($16.000 for lot 3.5), in 125 g and 250 g, with four grinds.
- Route data after the farm is illustrative and marked "por confirmar" in the UI until the owner supplies real places and dates. Only the farm location and the roast dates are real.
- Page copy is Spanish. Everything written into the repository is English.

## Brand Commitments
- Binding visual constraints from the owner (v3 round): light ground; sophisticated and futuristic; must not look like the 1990s; richer color and text color than a plain black-on-white; cards and panels with border, shadow and depth; many tasteful JavaScript effects that serve the idea of a trail; an improved presentation of the bag photo.
- Binding concept from the owner: brown coffee footprints and falling coffee beans along the route, from where the coffee came from to where it arrived.
- Binding content from the owner: brewing gear (Chemex, V60, Aeropress and the rest a coffee enthusiast owns) shown beside the bag, and recipes for brewing good coffee.
- Name: RASTRO. Tagline in use: "Cada café deja un rastro." The brand idea is that every coffee can be followed ("rastro" means trail).
- The brand art (logo mark, disc of beans, bag) is built from code in `design-src/` and is this page's own design. It is not the logo printed on the store's physical bag.

## Evidence on Hand
- Recipes are generic starting recipes (standard ratios and times) until the roaster supplies his own; they are labeled as base recipes and are not claims about this coffee.
- One product image: `assets/rastro_003.png` (the bag).
- Lot data from the store's public API.
- Absent, and not to be fabricated: photos of the farm or the roastery, testimonials, press, customer counts, and any real route stops other than the farm.

## Product Principles
- Show the route, not a claim about it: the map is the proof.
- Be honest about what is confirmed. Illustrative data is labeled until it is replaced.
- The QR scan on a phone is the main path; the desktop page is the same page, not a separate product.
- Selling is secondary to trust: the buy link is always available but never interrupts the story.

## Accessibility & Inclusion
- Meet WCAG AA contrast, keyboard operation for lot tabs and timeline, and `prefers-reduced-motion`.
- The timeline must tell the whole route even when the map fails to load.
