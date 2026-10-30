/**
 * ============================================================================
 *  tests/04-product.spec.ts  →  DETALLE DE PRODUCTO
 * ============================================================================
 *  Conceptos nuevos:
 *    - Generar tests a partir de TODOS los datos de prueba (7 tests de una).
 *    - toBeEnabled / toBeDisabled / toHaveValue / toHaveAttribute
 *    - Test negativo: página que no existe (404)
 * ============================================================================
 */
import { test, expect } from '../fixtures/pages.fixture';
import { ALL_PRODUCTS, PRODUCTS } from '../test-data/products';
import { formatPrice } from '../utils/price';

test.describe('Detalle de producto', () => {
  // ── Un test por producto ──────────────────────────────────────────────────
  // Como estos tests están en un describe con fullyParallel, los 7 corren en
  // paralelo, cada uno en su propio navegador.
  for (const product of ALL_PRODUCTS) {
    test(`"${product.name}" muestra nombre, precio y estado correctos`, async ({ productPage }) => {
      await productPage.open(product.handle);

      await expect(productPage.name).toHaveText(product.name);
      await expect(productPage.price).toHaveText(formatPrice(product.price));

      // Un if dentro del test: el mismo test verifica cosas distintas según
      // el dato (agotado o disponible).
      if (product.soldOut) {
        // Un <input type="submit"> muestra su texto en el atributo `value`.
        await expect(productPage.addToCartButton).toHaveValue('Sold Out');
        await expect(productPage.addToCartButton).toBeDisabled();
      } else {
        await expect(productPage.addToCartButton).toHaveValue('Add to Cart');
        await expect(productPage.addToCartButton).toBeEnabled();
      }
    });
  }

  test('muestra imagen principal y descripción', async ({ productPage }) => {
    await productPage.open(PRODUCTS.GREY_JACKET.handle);
    await expect(productPage.mainImage).toBeVisible();
    await expect(productPage.mainImage).toHaveAttribute('src', /fleece/);
    await expect(productPage.description).toContainText('This area is populated by the product description');
  });

  test('muestra el selector de variante con la opción del producto', async ({ productPage }) => {
    await productPage.open(PRODUCTS.GREY_JACKET.handle);
    // Para un <select>, toHaveValue verifica la opción elegida.
    await expect(productPage.variantSelect).toHaveValue('Grey jacket');
  });

  test('muestra productos relacionados que se pueden abrir', async ({ homePage, productPage, page }) => {
    // Detalle descubierto explorando la web: "You Might Also Like..." solo
    // aparece si entrás al producto DESDE una colección
    // (/collections/frontpage/products/grey-jacket), no por /products/grey-jacket.
    // Por eso llegamos como un usuario real: desde la Home.
    await homePage.goto();
    await homePage.featuredProducts.open(PRODUCTS.GREY_JACKET.name);
    await expect(page).toHaveURL(/\/collections\/frontpage\/products\/grey-jacket/);

    await expect(productPage.relatedProducts.items.first()).toBeVisible();
    const relatedNames = await productPage.relatedProducts.getNames();

    // Assertion genérica sobre un array: no debe recomendarse a sí mismo.
    expect(relatedNames).not.toContain(PRODUCTS.GREY_JACKET.name);
    expect(relatedNames.length).toBeGreaterThan(0);

    // Abrimos el primero y verificamos que el detalle cambió.
    const first = relatedNames[0];
    await productPage.relatedProducts.open(first);
    await expect(productPage.name).toHaveText(first);
    await expect(page).not.toHaveURL(/grey-jacket/);
  });

  test('un producto inexistente muestra la página 404', async ({ productPage, page }) => {
    await productPage.open('producto-que-no-existe-123');
    // Ojo al guion largo "–" (en dash) que usa Shopify en el título.
    await expect(page).toHaveTitle(/404 Not Found/);
    await expect(page.getByRole('heading', { name: 'Ooops. Sorry, something has gone wrong.' })).toBeVisible();
  });
});
