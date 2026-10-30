/**
 * ============================================================================
 *  tests/06-cart.spec.ts  →  CARRITO DE COMPRAS
 * ============================================================================
 *  Conceptos nuevos:
 *    - test.step(): divide un test largo en pasos con nombre (se ven en el
 *      reporte HTML y en el trace).
 *    - Validar CÁLCULOS (precio × cantidad, suma de totales).
 *    - Estado que se mantiene entre páginas dentro del MISMO test (cookies).
 *    - Patrón AAA: Arrange (preparar) → Act (actuar) → Assert (verificar).
 * ============================================================================
 */
import { test, expect } from '../fixtures/pages.fixture';
import { PRODUCTS } from '../test-data/products';

test.describe('Carrito', () => {
  test('agregar un producto actualiza el contador del header', { tag: '@smoke' }, async ({ productPage }) => {
    // Arrange
    await productPage.open(PRODUCTS.GREY_JACKET.handle);
    await expect(productPage.header.cartCount).toHaveText('(0)');

    // Act
    await productPage.addToCart();

    // Assert: el contador se actualiza por JavaScript sin recargar.
    // toHaveText reintenta hasta ver "(1)".
    await expect(productPage.header.cartCount).toHaveText('(1)');
  });

  test('el producto agregado aparece en el carrito con su precio', async ({ productPage, cartPage }) => {
    const product = PRODUCTS.GREY_JACKET;

    await test.step('Agregar producto', async () => {
      await productPage.open(product.handle);
      await productPage.addToCart();
    });

    await test.step('Ir al carrito', async () => {
      // La cookie del carrito quedó guardada en el navegador de ESTE test,
      // así que al ir a /cart el producto sigue ahí.
      await cartPage.goto();
    });

    await test.step('Verificar contenido', async () => {
      await expect(cartPage.lineItems).toHaveCount(1);
      await expect(cartPage.row(product.name)).toBeVisible();
      await expect(cartPage.quantityInput(product.name)).toHaveValue('1');
      expect(await cartPage.getUnitPrice(product.name)).toBe(product.price);
      expect(await cartPage.getTotal()).toBe(product.price);
    });
  });

  test('agregar dos productos distintos suma el total', async ({ productPage, cartPage }) => {
    const items = [PRODUCTS.GREY_JACKET, PRODUCTS.STRIPED_TOP];

    for (const item of items) {
      await productPage.open(item.handle);
      await productPage.addToCart();
    }
    await expect(productPage.header.cartCount).toHaveText('(2)');

    await cartPage.goto();
    await expect(cartPage.lineItems).toHaveCount(2);

    // reduce() suma: arranca en 0 y va acumulando cada precio.
    const expectedTotal = items.reduce((sum, p) => sum + p.price, 0); // 55 + 50 = 105
    expect(await cartPage.getTotal()).toBe(expectedTotal);
  });

  test('agregar el mismo producto dos veces suma cantidad (no duplica la fila)', async ({ productPage, cartPage }) => {
    await productPage.open(PRODUCTS.NOIR_JACKET.handle);
    await productPage.addToCart();
    await productPage.addToCart();

    await cartPage.goto();
    await expect(cartPage.lineItems).toHaveCount(1);
    await expect(cartPage.quantityInput(PRODUCTS.NOIR_JACKET.name)).toHaveValue('2');
  });

  test('cambiar la cantidad recalcula subtotal, total y contador', async ({ productPage, cartPage }) => {
    const product = PRODUCTS.NOIR_JACKET;
    const quantity = 3;

    await test.step('Preparar: carrito con 1 unidad', async () => {
      await productPage.open(product.handle);
      await productPage.addToCart();
      await cartPage.goto();
    });

    await test.step(`Cambiar cantidad a ${quantity}`, async () => {
      await cartPage.setQuantity(product.name, quantity);
    });

    await test.step('Verificar cálculos', async () => {
      await expect(cartPage.quantityInput(product.name)).toHaveValue(String(quantity));
      expect(await cartPage.getLineTotal(product.name)).toBe(product.price * quantity); // 180
      expect(await cartPage.getTotal()).toBe(product.price * quantity);
      await expect(cartPage.header.cartCount).toHaveText(`(${quantity})`);
    });
  });

  test('poner cantidad 0 elimina el producto', async ({ productPage, cartPage }) => {
    await productPage.open(PRODUCTS.STRIPED_TOP.handle);
    await productPage.addToCart();
    await cartPage.goto();

    await cartPage.setQuantity(PRODUCTS.STRIPED_TOP.name, 0);
    await expect(cartPage.emptyMessage).toBeVisible();
  });

  test('eliminar con la "x" deja el carrito vacío', async ({ productPage, cartPage }) => {
    await productPage.open(PRODUCTS.GREY_JACKET.handle);
    await productPage.addToCart();
    await cartPage.goto();

    await cartPage.remove(PRODUCTS.GREY_JACKET.name);

    await expect(cartPage.lineItems).toHaveCount(0);
    await expect(cartPage.emptyMessage).toBeVisible();
    await expect(cartPage.header.cartCount).toHaveText('(0)');
  });

  test('el carrito vacío ofrece seguir comprando', async ({ cartPage, page }) => {
    await cartPage.goto();
    await expect(cartPage.heading).toHaveText('My Cart');
    await expect(cartPage.emptyMessage).toBeVisible();

    await cartPage.cartSection.getByRole('link', { name: 'Continue Shopping' }).click();
    await expect(page).toHaveURL(/\/collections\/all/);
  });

  test('un producto agotado no se puede agregar', async ({ productPage }) => {
    await productPage.open(PRODUCTS.BROWN_SHADES.handle);
    await expect(productPage.addToCartButton).toBeDisabled();
    // force: true saltea los chequeos de Playwright e intenta el click igual.
    // Lo usamos SOLO para demostrar que, aunque se intente, nada cambia.
    await productPage.addToCartButton.click({ force: true });
    await expect(productPage.header.cartCount).toHaveText('(0)');
  });

  test('se puede escribir una nota para el pedido', async ({ productPage, cartPage }) => {
    await productPage.open(PRODUCTS.GREY_JACKET.handle);
    await productPage.addToCart();
    await cartPage.goto();

    const note = 'Por favor, envolver para regalo';
    await cartPage.noteTextarea.fill(note);
    await expect(cartPage.noteTextarea).toHaveValue(note);
  });
});
