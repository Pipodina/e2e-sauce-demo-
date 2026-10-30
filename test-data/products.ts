/**
 * ============================================================================
 *  test-data/products.ts  →  DATOS DE PRUEBA (separados del código)
 * ============================================================================
 *  Principio: los tests NO deberían tener datos "hardcodeados" desparramados.
 *  Si mañana cambia el precio del "Grey jacket", lo cambiás en UN solo lugar.
 *
 *  ¿Quién usa este archivo?
 *    → Los archivos de /tests lo importan:  import { PRODUCTS } from '../test-data/products';
 *    → Los Page Objects NO lo importan: un Page Object sabe CÓMO interactuar
 *      con la página, pero no QUÉ datos usar. Eso lo decide el test.
 * ============================================================================
 */

// `interface` (TypeScript) = el "molde" que describe qué forma tiene un dato.
// Si escribís mal una propiedad (ej: `prise` en vez de `price`), TypeScript
// te marca el error ANTES de correr el test.
export interface Product {
  name: string;     // Nombre visible en la web
  handle: string;   // Parte final de la URL: /products/<handle>
  price: number;    // Precio en libras (£) como número, para poder comparar
  soldOut: boolean; // ¿Está agotado?
}

// `as const` + `satisfies` es un truco de TypeScript:
//  - satisfies Record<string, Product> → valida que cada entrada cumpla el molde.
//  - Y a la vez conserva las claves exactas (GREY_JACKET, NOIR_JACKET...) para
//    que el autocompletado te sugiera PRODUCTS.GREY_JACKET al escribir.
export const PRODUCTS = {
  BLACK_HEELS:    { name: 'Black heels',    handle: 'flower-print-jeans', price: 45.0,  soldOut: false },
  BRONZE_SANDALS: { name: 'Bronze sandals', handle: 'bronze-sandals',     price: 39.99, soldOut: false },
  BROWN_SHADES:   { name: 'Brown Shades',   handle: 'brown-shades',       price: 20.0,  soldOut: true  },
  GREY_JACKET:    { name: 'Grey jacket',    handle: 'grey-jacket',        price: 55.0,  soldOut: false },
  NOIR_JACKET:    { name: 'Noir jacket',    handle: 'noir-jacket',        price: 60.0,  soldOut: false },
  STRIPED_TOP:    { name: 'Striped top',    handle: 'striped-top',        price: 50.0,  soldOut: false },
  WHITE_SANDALS:  { name: 'White sandals',  handle: 'white-sandals',      price: 25.0,  soldOut: true  },
} as const satisfies Record<string, Product>;

// Listas derivadas: se CALCULAN a partir de PRODUCTS, así no se desincronizan.
export const ALL_PRODUCTS: Product[] = Object.values(PRODUCTS);
export const AVAILABLE_PRODUCTS = ALL_PRODUCTS.filter((p) => !p.soldOut);
export const SOLD_OUT_PRODUCTS = ALL_PRODUCTS.filter((p) => p.soldOut);

// Los 3 productos destacados que muestra la Home (colección "frontpage").
export const FEATURED_PRODUCTS: Product[] = [
  PRODUCTS.GREY_JACKET,
  PRODUCTS.NOIR_JACKET,
  PRODUCTS.STRIPED_TOP,
];
