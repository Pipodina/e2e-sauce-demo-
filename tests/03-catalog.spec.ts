/**
 * ============================================================================
 *  tests/03-catalog.spec.ts  →  CATÁLOGO DE PRODUCTOS
 * ============================================================================
 *  Conceptos nuevos:
 *    - Leer DATOS de la página (Page Object → array de objetos) y comparar
 *      con toEqual (comparación profunda de objetos).
 *    - expect.soft: aserciones que NO cortan el test al fallar.
 *    - Diferencia entre "assertion de Playwright" (sobre un Locator, reintenta)
 *      y "assertion genérica" (sobre un valor ya leído, no reintenta).
 * ============================================================================
 */
import { test, expect } from '../fixtures/pages.fixture';
import { ALL_PRODUCTS, AVAILABLE_PRODUCTS, PRODUCTS, SOLD_OUT_PRODUCTS } from '../test-data/products';

test.describe('Catálogo', () => {
  test.beforeEach(async ({ catalogPage }) => {
    await catalogPage.goto();
  });

  test('muestra el encabezado "Products"', async ({ catalogPage }) => {
    await expect(catalogPage.heading).toHaveText('Products');
  });

  test('lista todos los productos con su precio y estado', { tag: '@smoke' }, async ({ catalogPage }) => {
    // Esperamos primero con una web-first assertion (reintenta hasta que
    // aparezcan los 7). Si leyéramos los datos sin esperar, podríamos leer
    // la grilla a medio cargar.
    await expect(catalogPage.grid.items).toHaveCount(ALL_PRODUCTS.length);

    // Ahora sí leemos la "foto" de la grilla.
    const products = await catalogPage.grid.getProducts();

    // Construimos lo esperado con la misma forma { name, price, soldOut }.
    const expected = ALL_PRODUCTS.map(({ name, price, soldOut }) => ({ name, price, soldOut }));

    // toEqual compara objeto por objeto, propiedad por propiedad.
    // OJO: `products` es un valor normal (no un Locator) → este expect NO
    // reintenta. Por eso esperamos antes con toHaveCount.
    expect(products).toEqual(expected);
  });

  test('los productos agotados muestran "Sold Out"', async ({ catalogPage }) => {
    for (const product of SOLD_OUT_PRODUCTS) {
      // expect.soft: si falla, ANOTA el error y SIGUE con el siguiente producto.
      // Al final el test se marca como fallido con TODOS los errores juntos.
      // Útil cuando querés ver todos los problemas de una sola corrida.
      await expect.soft(catalogPage.grid.item(product.name).locator('.sold-out')).toHaveText('Sold Out');
    }
  });

  test('los productos disponibles NO muestran "Sold Out"', async ({ catalogPage }) => {
    for (const product of AVAILABLE_PRODUCTS) {
      // `.not` invierte cualquier assertion.
      await expect.soft(catalogPage.grid.item(product.name).locator('.sold-out')).not.toBeVisible();
    }
  });

  test('cada producto tiene imagen', async ({ catalogPage }) => {
    // Recorremos todos los items y verificamos que su <img> tenga src y alt.
    const images = catalogPage.grid.items.locator('img');
    await expect(images).toHaveCount(ALL_PRODUCTS.length);
    for (const img of await images.all()) {
      // .all() devuelve un array de Locators, uno por elemento.
      await expect(img).toHaveAttribute('src', /cdn\/shop\/products/);
      await expect(img).toHaveAttribute('alt', /.+/); // alt no vacío
    }
  });

  test('click en un producto abre su detalle', async ({ catalogPage, productPage, page }) => {
    await catalogPage.openProduct(PRODUCTS.NOIR_JACKET.name);
    await expect(page).toHaveURL(new RegExp(`/products/${PRODUCTS.NOIR_JACKET.handle}`));
    await expect(productPage.name).toHaveText(PRODUCTS.NOIR_JACKET.name);
  });
});
