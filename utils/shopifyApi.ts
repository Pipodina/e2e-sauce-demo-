/**
 * ============================================================================
 *  utils/shopifyApi.ts  →  ATAJOS POR API (sin navegador)
 * ============================================================================
 *  Shopify expone endpoints JSON públicos:
 *    GET  /products/<handle>.js  → datos del producto (precio, variantes, stock)
 *    POST /cart/add.js           → agrega al carrito
 *    GET  /cart.js               → contenido del carrito
 *
 *  ¿Para qué sirven en tests de UI?
 *    Para PREPARAR datos rápido. Si querés probar el checkout, no necesitás
 *    navegar 3 páginas para llenar el carrito: lo hacés con 1 llamada API y
 *    después probás por UI solo lo que te interesa. Tests más rápidos y
 *    menos frágiles.
 *
 *  APIRequestContext es el tipo del fixture `request` y de `page.request`.
 *  Si usás `page.request`, comparte las COOKIES con el navegador del test:
 *  lo que agregues por API aparece en el carrito de la página.
 * ============================================================================
 */
import type { APIRequestContext } from '@playwright/test';

// Solo tipamos los campos que usamos de la respuesta de Shopify.
export interface ShopifyProduct {
  title: string;
  handle: string;
  price: number; // en CENTAVOS: 5500 = £55.00
  available: boolean;
  variants: { id: number; title: string; available: boolean }[];
}

export interface ShopifyCart {
  item_count: number;
  total_price: number; // en centavos
  items: { handle: string; quantity: number; title: string }[];
}

/**
 * GET con reintentos ante HTTP 429 ("Too Many Requests").
 * Shopify limita cuántas peticiones acepta por segundo. Si corremos muchos
 * tests en paralelo, a veces responde 429. En vez de fallar, esperamos un
 * poco más en cada intento (1s, 2s, 3s) y reintentamos. Esto se llama
 * "backoff" y es una práctica común al consumir APIs públicas.
 */
export async function getWithRetry(request: APIRequestContext, url: string, attempts = 4) {
  let response = await request.get(url);
  for (let i = 1; i < attempts && response.status() === 429; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * i)); // espera i segundos
    response = await request.get(url);
  }
  return response;
}

export async function getProduct(request: APIRequestContext, handle: string): Promise<ShopifyProduct> {
  const response = await getWithRetry(request, `/products/${handle}.js`);
  if (!response.ok()) throw new Error(`GET producto ${handle} → HTTP ${response.status()}`);
  // .json() convierte el cuerpo de la respuesta en un objeto JS.
  return (await response.json()) as ShopifyProduct;
}

/** Agrega un producto (su primera variante) al carrito, vía API. */
export async function addToCartViaApi(request: APIRequestContext, handle: string, quantity = 1): Promise<void> {
  const product = await getProduct(request, handle);
  const response = await request.post('/cart/add.js', {
    // `form` envía los datos como un formulario HTML (application/x-www-form-urlencoded)
    form: { id: product.variants[0].id, quantity },
  });
  if (!response.ok()) throw new Error(`POST /cart/add.js → HTTP ${response.status()}`);
}

export async function getCart(request: APIRequestContext): Promise<ShopifyCart> {
  const response = await getWithRetry(request, '/cart.js');
  return (await response.json()) as ShopifyCart;
}
