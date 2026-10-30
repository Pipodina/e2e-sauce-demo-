/**
 * ============================================================================
 *  tests/01-home.spec.ts  →  TU PRIMER ARCHIVO DE TESTS (leelo primero)
 * ============================================================================
 *  Conceptos de este archivo:
 *    - test() y test.describe()
 *    - Usar fixtures ({ homePage, page })
 *    - test.beforeEach()
 *    - expect() con "web-first assertions" (reintentan solas)
 *    - Tags (@smoke) para correr subconjuntos
 *
 *  Nombre del archivo: Playwright ejecuta los que terminan en .spec.ts
 *  dentro de testDir (ver playwright.config.ts).
 * ============================================================================
 */

// IMPORTANTE: importamos `test` y `expect` desde NUESTRO fixture, no desde
// '@playwright/test'. Así `test` ya trae homePage, cartPage, etc.
import { test, expect } from '../fixtures/pages.fixture';
import { FEATURED_PRODUCTS } from '../test-data/products';

// test.describe() AGRUPA tests relacionados. En el reporte se ven anidados:
//   Home › muestra el logo...
//   Home › muestra los productos destacados
test.describe('Home', () => {
  // beforeEach corre ANTES de CADA test de este describe.
  // Evitamos repetir "ir a la home" en todos los tests.
  // Recibe los mismos fixtures que un test.
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto(); // → page.goto('/') → https://sauce-demo.myshopify.com/
  });

  // Anatomía de un test:
  //   test('nombre descriptivo', { tag }, async ({ fixtures }) => { pasos + expects });
  // El tag '@smoke' permite correr solo los críticos:  npm run test:smoke
  test('carga con el título correcto', { tag: '@smoke' }, async ({ page }) => {
    // toHaveTitle verifica el <title> de la pestaña.
    // "Web-first assertion": si el título todavía no cargó, Playwright
    // REINTENTA hasta que se cumpla o pasen 10s (expect.timeout del config).
    // Por eso en Playwright casi NUNCA necesitás sleeps/waits manuales.
    await expect(page).toHaveTitle('Sauce Demo');
  });

  test('muestra el logo y el tagline', async ({ homePage }) => {
    // toBeVisible: el elemento existe Y se ve (no está oculto ni con tamaño 0).
    await expect(homePage.header.logo).toBeVisible();
    //                    ▲ header viene de BasePage (composición)

    // toContainText: el texto CONTIENE ese fragmento (no tiene que ser exacto).
    await expect(homePage.tagline).toContainText('Just a demo site showing off what Sauce can do.');
  });

  test('muestra los 3 productos destacados', { tag: '@smoke' }, async ({ homePage }) => {
    // toHaveCount: la cantidad de elementos que matchean el locator.
    await expect(homePage.featuredProducts.items).toHaveCount(FEATURED_PRODUCTS.length);

    // Comparamos los nombres contra los datos de prueba.
    // .map() transforma [{name:'Grey jacket',...}, ...] → ['Grey jacket', ...]
    const expectedNames = FEATURED_PRODUCTS.map((p) => p.name);

    // toHaveText con un ARRAY compara cada elemento en orden.
    await expect(homePage.featuredProducts.items.locator('h3')).toHaveText(expectedNames);
  });

  test('el carrito arranca vacío', async ({ homePage }) => {
    // Cada test arranca con un navegador limpio (sin cookies), así que el
    // carrito siempre está en 0. Esto se llama AISLAMIENTO de tests.
    await expect(homePage.header.cartCount).toHaveText('(0)');
  });

  test('el header muestra los links de cuenta', async ({ homePage }) => {
    await expect(homePage.header.loginLink).toBeVisible();
    await expect(homePage.header.signUpLink).toBeVisible();
    await expect(homePage.header.searchInput).toBeVisible();
  });
});
