/**
 * ============================================================================
 *  tests/10-e2e-checkout.spec.ts  →  FLUJO DE PUNTA A PUNTA (E2E)
 * ============================================================================
 *  Un test E2E recorre el camino completo de un usuario, uniendo VARIOS
 *  Page Objects. Es el lugar donde mejor se ve el valor del POM: el test se
 *  lee casi como un caso de prueba manual.
 *
 *  Conceptos nuevos:
 *    - Encadenar muchos Page Objects en un mismo flujo.
 *    - PREPARAR el estado por API (page.request) y verificar por UI.
 *    - test.slow(): triplica el timeout para tests largos.
 *    - ETIQUETAS DE ALLURE (allure-js-commons): severidad, epic/feature/story,
 *      responsable, descripción y links. Enriquecen el reporte de Allure
 *      (`npm run allure`) y permiten filtrar por ellas. No cambian lo que el
 *      test hace: si sacás estas líneas, el test verifica exactamente lo mismo.
 *
 *  Sin etiquetas, Allure igual muestra todos los tests: los test.step() se
 *  ven como pasos y los tags de Playwright (@smoke) como tags de Allure.
 *
 *  Nos detenemos al llegar al checkout de Shopify: no completamos el pago
 *  porque es una tienda real (y el checkout es una app de Shopify, no de la
 *  tienda; tendría sus propios Page Objects).
 * ============================================================================
 */
import { test, expect } from '../fixtures/pages.fixture';
import { PRODUCTS } from '../test-data/products';
import { addToCartViaApi } from '../utils/shopifyApi';
// `import * as allure` trae todas las funciones de Allure bajo el nombre `allure`.
import * as allure from 'allure-js-commons';

test.describe('E2E: compra', () => {
  // beforeEach también sirve para poner etiquetas comunes a todos los tests
  // del describe (así no las repetís en cada uno).
  test.beforeEach(async () => {
    // Jerarquía de NEGOCIO (en Allure: pestaña "Behaviors" / agrupado por epic):
    //   Epic    = gran área funcional
    //   Feature = funcionalidad dentro del área
    //   Story   = historia de usuario concreta (se suele poner por test)
    await allure.epic('Tienda online');
    await allure.feature('Compra');
  });

  test('buscar, agregar, ajustar cantidad y llegar al checkout', { tag: '@smoke' }, async ({
    homePage,
    searchResultsPage,
    productPage,
    cartPage,
    page,
  }) => {
    test.slow(); // flujo largo: le damos más tiempo

    // Conviene poner las etiquetas AL PRINCIPIO del test: si el test falla en
    // el paso 2, las etiquetas ya quedaron registradas.
    await allure.story('Comprar un producto buscado');
    // Severidad: blocker | critical | normal | minor | trivial.
    // En el reporte podés filtrar "mostrame solo los critical que fallaron".
    await allure.severity('critical');
    await allure.owner('QA Automation');
    await allure.description(
      'Recorre el camino feliz completo: Home → búsqueda → producto → carrito → checkout de Shopify.',
    );
    // Link a la historia o caso en Jira/Xray. En tu trabajo pondrías la URL real.
    await allure.link('https://sauce-demo.myshopify.com', 'Tienda bajo prueba');

    const product = PRODUCTS.GREY_JACKET;

    await test.step('1. El usuario entra a la tienda', async () => {
      await homePage.goto();
      await expect(homePage.header.cartCount).toHaveText('(0)');
    });

    await test.step('2. Busca "jacket"', async () => {
      await homePage.header.search('jacket');
      await expect(searchResultsPage.keywordMessage).toContainText('jacket');
    });

    await test.step(`3. Abre "${product.name}"`, async () => {
      await searchResultsPage.results.open(product.name);
      await expect(productPage.name).toHaveText(product.name);
    });

    await test.step('4. Lo agrega al carrito', async () => {
      await productPage.addToCart();
      await expect(productPage.header.cartCount).toHaveText('(1)');
    });

    await test.step('5. Va al carrito y pone 2 unidades', async () => {
      await cartPage.goto();
      await cartPage.setQuantity(product.name, 2);
      expect(await cartPage.getTotal()).toBe(product.price * 2);
    });

    await test.step('6. Hace click en "Check Out"', async () => {
      await cartPage.checkout();
      // Shopify redirige a /checkouts/... (otra aplicación).
      // Aumentamos el timeout de ESTA assertion porque la redirección tarda.
      await expect(page).toHaveURL(/\/checkouts\//, { timeout: 30_000 });
      await expect(page).toHaveTitle(/Checkout/);
    });
  });

  test('carrito preparado por API, verificado por UI', async ({ page, cartPage }) => {
    await allure.story('Ver el carrito con varios productos');
    await allure.severity('normal');
    // page.request comparte cookies con `page`: lo que agregamos por API
    // aparece en el carrito del navegador. Ahorra navegar 2 productos por UI.
    await addToCartViaApi(page.request, PRODUCTS.NOIR_JACKET.handle, 1);
    await addToCartViaApi(page.request, PRODUCTS.BRONZE_SANDALS.handle, 2);

    await cartPage.goto();

    await expect(cartPage.lineItems).toHaveCount(2);
    await expect(cartPage.quantityInput(PRODUCTS.NOIR_JACKET.name)).toHaveValue('1');
    await expect(cartPage.quantityInput(PRODUCTS.BRONZE_SANDALS.name)).toHaveValue('2');
    await expect(cartPage.header.cartCount).toHaveText('(3)');

    // Comparamos en centavos para evitar problemas de decimales: 60 + 2×39.99
    const expectedCents = Math.round(PRODUCTS.NOIR_JACKET.price * 100) + Math.round(PRODUCTS.BRONZE_SANDALS.price * 100) * 2;
    expect(Math.round((await cartPage.getTotal()) * 100)).toBe(expectedCents);
  });

  test('el link "Check Out" del header lleva al carrito', async ({ homePage, page }) => {
    await allure.story('Acceder al carrito desde el header');
    await allure.severity('minor');
    await homePage.goto();
    await homePage.header.goToCheckout();
    await expect(page).toHaveURL(/\/cart$/);
  });
});
