/**
 * ============================================================================
 *  tests/05-search.spec.ts  →  BÚSQUEDA
 * ============================================================================
 *  Conceptos nuevos:
 *    - Probar la MISMA funcionalidad de 2 formas: como usuario (UI) y directo
 *      por URL (más rápido).
 *    - Leer parámetros de la URL con la clase URL de JavaScript.
 *    - Casos positivos, negativos y de borde.
 * ============================================================================
 */
import { test, expect } from '../fixtures/pages.fixture';
import { PRODUCTS } from '../test-data/products';

test.describe('Búsqueda', () => {
  test('buscar desde el header muestra resultados', { tag: '@smoke' }, async ({ homePage, searchResultsPage, page }) => {
    await homePage.goto();
    await homePage.header.search('jacket');

    // Verificamos que el término viaja en la URL: /search?type=product&q=jacket
    await expect(page).toHaveURL(/\/search\?/);
    const url = new URL(page.url());
    expect(url.searchParams.get('q')).toBe('jacket');

    await expect(searchResultsPage.heading).toHaveText('Search Results');
    await expect(searchResultsPage.keywordMessage).toContainText('Showing results for');
    await expect(searchResultsPage.keywordMessage).toContainText('jacket');

    // No verificamos la cantidad exacta (el buscador de Shopify puede traer
    // resultados "parecidos"); sí que estén los 2 que seguro deben aparecer.
    const names = await searchResultsPage.results.getNames();
    expect(names).toContain(PRODUCTS.GREY_JACKET.name);
    expect(names).toContain(PRODUCTS.NOIR_JACKET.name);
  });

  test('buscar un nombre exacto encuentra el producto', async ({ searchResultsPage }) => {
    await searchResultsPage.searchFor(PRODUCTS.BRONZE_SANDALS.name);
    // .item(name) busca la tarjeta por nombre dentro de los resultados.
    await expect(searchResultsPage.results.item(PRODUCTS.BRONZE_SANDALS.name)).toBeVisible();
  });

  test('una búsqueda sin coincidencias muestra "No results found"', async ({ searchResultsPage }) => {
    // Ojo: el buscador de Shopify es "difuso" (fuzzy). Una palabra como
    // "zzzproductoinexistente" igual trae resultados. Usamos letras sin sentido.
    const term = 'zzxqwvk';
    await searchResultsPage.searchFor(term);
    await expect(searchResultsPage.keywordMessage).toContainText(`No results found for ${term}`);
    await expect(searchResultsPage.results.items).toHaveCount(0);
  });

  test('la búsqueda no distingue mayúsculas', async ({ searchResultsPage }) => {
    await searchResultsPage.searchFor('JACKET');
    await expect(searchResultsPage.results.item(PRODUCTS.GREY_JACKET.name)).toBeVisible();
  });

  test('un resultado de búsqueda abre el producto', async ({ searchResultsPage, productPage }) => {
    await searchResultsPage.searchFor('noir');
    await searchResultsPage.results.open(PRODUCTS.NOIR_JACKET.name);
    await expect(productPage.name).toHaveText(PRODUCTS.NOIR_JACKET.name);
  });
});
