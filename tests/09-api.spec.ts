/**
 * ============================================================================
 *  tests/09-api.spec.ts  →  TESTS DE API (sin abrir el navegador)
 * ============================================================================
 *  Playwright no es solo UI: el fixture `request` hace llamadas HTTP.
 *  Usa la misma baseURL del config, por eso escribimos '/products.json'.
 *
 *  Conceptos nuevos:
 *    - fixture `request` (APIRequestContext)
 *    - Validar status code, headers y cuerpo JSON
 *    - Cruzar datos de API con datos de prueba
 *    - Importar helpers desde /utils
 *
 *  Estos tests son MUY rápidos (milisegundos) porque no dibujan nada.
 * ============================================================================
 */
import { test, expect } from '../fixtures/pages.fixture';
import { ALL_PRODUCTS, PRODUCTS } from '../test-data/products';
import { addToCartViaApi, getCart, getProduct, getWithRetry } from '../utils/shopifyApi';

// Por defecto (fullyParallel en el config) los tests de este archivo correrían
// en paralelo. Con mode 'default' corren UNO DETRÁS DEL OTRO en un solo worker,
// para no disparar el límite de peticiones de Shopify (HTTP 429).
// Existe también mode 'serial': igual, pero si un test falla saltea el resto
// (útil cuando cada test depende del anterior, algo que en general conviene evitar).
test.describe.configure({ mode: 'default' });

test.describe('API de la tienda', () => {
  test('GET /products.json responde 200 con todos los productos', { tag: '@smoke' }, async ({ request }) => {
    // getWithRetry = request.get() + reintento si Shopify responde 429.
    const response = await getWithRetry(request, '/products.json');

    // Assertions específicas para respuestas de API
    expect(response.ok()).toBeTruthy();   // status entre 200 y 299
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    // Estructura esperada: { products: [ {...}, {...} ] }
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products).toHaveLength(ALL_PRODUCTS.length);

    // Todos los handles de nuestros datos de prueba existen en la API.
    const handles: string[] = body.products.map((p: { handle: string }) => p.handle);
    for (const product of ALL_PRODUCTS) {
      expect(handles).toContain(product.handle);
    }
  });

  // Un test por producto: el precio y el stock de la API coinciden con lo esperado.
  for (const product of ALL_PRODUCTS) {
    test(`API: "${product.name}" tiene precio y disponibilidad correctos`, async ({ request }) => {
      const apiProduct = await getProduct(request, product.handle);
      expect(apiProduct.title).toBe(product.name);
      // La API devuelve centavos: 55.00 → 5500. Math.round evita errores de
      // coma flotante (39.99 * 100 = 3998.9999999...).
      expect(apiProduct.price).toBe(Math.round(product.price * 100));
      expect(apiProduct.available).toBe(!product.soldOut);
    });
  }

  test('un producto inexistente devuelve 404', async ({ request }) => {
    const response = await getWithRetry(request, '/products/no-existe-xyz.js');
    expect(response.status()).toBe(404);
  });

  test('agregar al carrito por API y leerlo', async ({ request }) => {
    // El `request` de este test tiene su propio "jar" de cookies, así que el
    // carrito empieza vacío y no se mezcla con otros tests.
    await addToCartViaApi(request, PRODUCTS.GREY_JACKET.handle, 2);

    const cart = await getCart(request);
    expect(cart.item_count).toBe(2);
    expect(cart.items[0].handle).toBe(PRODUCTS.GREY_JACKET.handle);
    expect(cart.total_price).toBe(PRODUCTS.GREY_JACKET.price * 2 * 100);
  });

  test('BUG CONOCIDO: la API deja agregar un producto agotado', async ({ request }) => {
    // HALLAZGO REAL al armar este proyecto: la UI deshabilita "Add to Cart"
    // para "Brown Shades" (agotado), pero POST /cart/add.js responde 200 y
    // lo agrega igual. La validación existe solo en el frontend.
    //
    // test.fail() marca el test como "se espera que falle":
    //   - Mientras el bug exista, la assertion falla → el test figura OK
    //     (como "expected to fail") y la suite queda verde.
    //   - Si un día lo arreglan, la assertion pasa → Playwright avisa
    //     "passed unexpectedly" y sabés que tenés que sacar el test.fail().
    // Es una forma de DOCUMENTAR un bug en el código sin romper el pipeline.
    test.fail(true, 'El backend no valida stock en /cart/add.js');

    // Comportamiento CORRECTO esperado: la función debería LANZAR un error.
    // Con promesas se usa `.rejects` para verificar que fallan.
    await expect(addToCartViaApi(request, PRODUCTS.BROWN_SHADES.handle)).rejects.toThrow(/HTTP 4\d\d/);
  });
});
