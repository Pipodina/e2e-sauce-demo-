/**
 * ============================================================================
 *  pages/CartPage.ts  →  PAGE OBJECT DEL CARRITO  ( /cart )
 * ============================================================================
 *  Es la página más rica: tiene una LISTA de filas y cada fila tiene sus
 *  propios elementos (nombre, precio, cantidad, total, botón eliminar).
 *
 *  Patrón: un método que devuelve el Locator de UNA fila, y métodos que
 *  trabajan "dentro" de esa fila. Así nunca confundimos el precio de un
 *  producto con el de otro.
 * ============================================================================
 */
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { parsePrice } from '../utils/price';

export class CartPage extends BasePage {
  protected readonly path = '/cart';

  // ¡Cuidado! El carrito también se dibuja en un "drawer" oculto arriba de
  // la página, con los mismos inputs. Por eso TODO lo acotamos a #cart.
  readonly cartSection: Locator;
  readonly lineItems: Locator;
  readonly emptyMessage: Locator;
  readonly total: Locator;
  readonly updateButton: Locator;
  readonly checkoutButton: Locator;
  readonly noteTextarea: Locator;
  readonly continueShoppingLink: Locator;

  constructor(page: Page) {
    super(page);
    this.cartSection = page.locator('#cart');
    // Una "fila de producto" es un .row que CONTIENE un input de cantidad.
    // filter({ has }) descarta la fila del total, que también tiene clase .row
    this.lineItems = this.cartSection
      .locator('.row')
      .filter({ has: page.locator('input[name="updates[]"]') });
    this.emptyMessage = this.cartSection.getByText('It appears that your cart is currently empty!');
    this.total = this.cartSection.locator('.cart.total h2');
    this.updateButton = this.cartSection.getByRole('button', { name: 'Update' });
    this.checkoutButton = this.cartSection.getByRole('button', { name: 'Check Out' });
    this.noteTextarea = this.cartSection.getByPlaceholder('Add a note to your order...');
    this.continueShoppingLink = this.cartSection.getByRole('link', { name: /Continue Shopping/ });
  }

  // ── Elementos de UNA fila ─────────────────────────────────────────────────

  /** La fila del producto cuyo nombre contiene `productName`. */
  row(productName: string): Locator {
    // hasText busca texto PARCIAL: la web muestra "Grey jacket - Grey jacket".
    return this.lineItems.filter({ hasText: productName });
  }

  quantityInput(productName: string): Locator {
    return this.row(productName).locator('input[name="updates[]"]');
  }

  // ── Acciones ──────────────────────────────────────────────────────────────

  /** Cambia la cantidad y aprieta "Update" (recarga la página). */
  async setQuantity(productName: string, quantity: number): Promise<void> {
    await this.quantityInput(productName).fill(String(quantity));
    await this.updateButton.click();
    // El click envía un formulario → el navegador recarga /cart.
    // Esperamos a que la nueva página termine de cargar.
    await this.page.waitForLoadState('load');
  }

  /** Click en la "x" de la fila. */
  async remove(productName: string): Promise<void> {
    await this.row(productName).locator('.remove a').click();
    await this.page.waitForLoadState('load');
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  // ── Lecturas (devuelven datos para que el TEST haga el expect) ─────────────
  // Regla de POM: el Page Object NO hace asserts. Devuelve datos o locators
  // y el test decide qué esperar. Así el mismo método sirve para casos
  // positivos y negativos.

  async getLineTotal(productName: string): Promise<number> {
    return parsePrice(await this.row(productName).locator('.total').innerText());
  }

  async getUnitPrice(productName: string): Promise<number> {
    return parsePrice(await this.row(productName).locator('.price').innerText());
  }

  async getTotal(): Promise<number> {
    return parsePrice(await this.total.innerText());
  }
}
