// Lot and route data for the Rastro traceability page.
//
// Facts taken from rastrotienda.cl (WooCommerce Store API): lots, roast dates,
// producer, importer, roaster, prices and stock.
//
// Stop images come from rastrotienda.cl's own media library (RASTRO's brand material).
//
// ILLUSTRATIVE: every stop with `verified: false` is a plausible placeholder
// location. Replace it with the real place and set `verified: true`.

export const STORE_BASE = 'https://rastrotienda.cl/producto/';

export const SHARED = {
  origin: 'Caranavi, La Paz, Bolivia',
  producer: 'Guillermo Chuquimia',
  farm: 'Finca Chuquimia',
  altitude: '1.600+ msnm',
  variety: 'Java',
  process: 'Lavado, secado en tarima',
  screen: '16/17',
  harvest: '2025',
  sca: 86,
  importer: 'Kawas',
  roaster: 'Ignacio Ponce · Bobo Coffee Roasters',
};

// `date` is an ISO date (YYYY-MM-DD) or null when unknown.
const BASE_STOPS = [
  {
    id: 'farm',
    image: { src: 'assets/brand/caranavi.webp', w: 900, h: 600, alt: 'Montañas verdes de Caranavi, en Bolivia' },
    label: 'Finca Chuquimia',
    kind: 'Origen',
    place: 'Caranavi, La Paz, Bolivia',
    lat: -15.8317,
    lng: -67.5686,
    date: null,
    verified: true,
    text: 'Cosecha 2025 de variedad Java a más de 1.600 msnm, beneficiada por vía lavada.',
  },
  {
    id: 'drying',
    label: 'Salida desde La Paz',
    kind: 'Acopio',
    place: 'La Paz, Bolivia',
    lat: -16.4897,
    lng: -68.1193,
    date: null,
    verified: false,
    text: 'El café en pergamino baja de los Yungas hacia La Paz para su preparación de exportación.',
  },
  {
    id: 'port',
    label: 'Puerto de Arica',
    kind: 'Tránsito',
    place: 'Arica, Chile',
    lat: -18.4783,
    lng: -70.3126,
    date: null,
    verified: false,
    text: 'Cruza la frontera y entra a Chile por el corredor Bolivia–Arica.',
  },
  {
    id: 'importer',
    image: { src: 'assets/brand/kawas.webp', w: 360, h: 184, alt: 'Logotipo de Kawas, café de origen', logo: true },
    label: 'Importador Kawas',
    kind: 'Importación',
    place: 'Santiago, Chile',
    lat: -33.4489,
    lng: -70.6693,
    date: null,
    verified: false,
    text: 'Kawas recibe y almacena el café verde del microlote.',
  },
  {
    id: 'roaster',
    image: { src: 'assets/brand/tostador.webp', w: 640, h: 766, alt: 'Un tostador huele el café recién tostado' },
    badge: { src: 'assets/brand/bobo.webp', w: 220, h: 220, alt: 'Logotipo de Bobo Coffee Roasters' },
    label: 'Bobo Coffee Roasters',
    kind: 'Tueste',
    place: 'Valparaíso, Chile',
    lat: -33.0472,
    lng: -71.6127,
    date: null, // filled in per lot
    verified: false,
    text: 'Ignacio Ponce tuesta el lote para resaltar su perfil floral.',
  },
  {
    id: 'rastro',
    image: { src: 'assets/brand/vasos.webp', w: 800, h: 799, alt: 'Vasos de café RASTRO con su etiqueta fucsia' },
    badge: { src: 'assets/brand/bluexpress.webp', w: 320, h: 294, alt: 'Blue Express, envíos a todo Chile', logo: true },
    label: 'Rastro',
    kind: 'Despacho',
    place: 'Santiago, Chile',
    lat: -33.4263,
    lng: -70.611,
    date: null,
    verified: false,
    text: 'Rastro empaca, muele según tu pedido y despacha a tu casa.',
  },
];

function stopsFor(roastDate) {
  return BASE_STOPS.map((s) => (s.id === 'roaster' ? { ...s, date: roastDate } : { ...s }));
}

export const LOTS = [
  {
    id: 'lote-3',
    slug: 'bolivia-lavado-java-lote-3',
    name: 'Bolivia Lavado Java',
    lotLabel: 'Lote 3',
    badge: null,
    roastDate: '2026-02-04',
    stock: null, // unknown in the API response
    regularPrice: 9000,
    salePrice: 8000,
    priceMax: 15000,
    stops: stopsFor('2026-02-04'),
  },
  {
    id: 'lote-3-1',
    slug: 'bolivia-lavado-java-lote-3-1',
    name: 'Bolivia Lavado Java',
    lotLabel: 'Lote 3.1',
    badge: null,
    roastDate: '2026-03-19',
    stock: 2,
    regularPrice: 9000,
    salePrice: 8000,
    priceMax: 15000,
    stops: stopsFor('2026-03-19'),
  },
  {
    id: 'lote-3-5',
    slug: 'bolivia-lavado-java-lote-3-5-dia-del-cafe',
    name: 'Bolivia Lavado Java',
    lotLabel: 'Lote 3.5',
    badge: 'Día del Café',
    roastDate: '2026-09-26',
    stock: 40,
    regularPrice: 9000,
    salePrice: 8000,
    priceMax: 16000,
    stops: stopsFor('2026-09-26'),
  },
];

export const FORMATS = ['125 g', '250 g'];
export const GRINDS = ['Grano entero', 'Gruesa (Francesa)', 'Media (V60)', 'Fina (Espresso doméstica)'];
