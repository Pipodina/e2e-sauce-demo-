/**
 * ============================================================================
 *  pages/ProductPage.ts  →  PAGE OBJECT DEL DETALLE DE PRODUCTO
 *                           ( /products/<handle> )
 * ============================================================================
 *  Conceptos nuevos en este archivo:
 *   - URL DINÁMICA: la ruta depende de qué producto abrimos.
 *   - ESPERAR UNA RESPUESTA DE RED (waitForResponse): "Add to Cart" no recarga
 *     la página; manda una petición AJAX en segundo plano. Esperamos a que el
 *     servidor responda antes de dar la acción por terminada.
 * ============================================================================
 */
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductGridComponent } from './components/ProductGridComponent';
import { parsePrice } from '../utils/price';

export class ProductPage extends BasePage {
  // A diferencia de las demás páginas, `path` NO es fijo: cambia según el
  // producto. Arranca en el listado y open() lo actualiza a /products/<handle>.
  // Así BasePage.goto() sigue funcionando sin cambios.
  protected path = '/collections/all';

  readonly name: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly variantSelect: Locator;
  readonly description: Locator;
  readonly mainImage: Locator;
  readonly relatedProducts: ProductGridComponent;

  constructor(page: Page) {
    super(page);
    // itemprop="name" es un atributo de SEO (schema.org) que Shopify agrega:
    // suele ser más estable que las clases CSS de diseño.
    this.name = page.locator('#buy [itemprop="name"]');
    this.price = page.locator('#product-price .product-price');
    // El botón es <input type="submit" id="add">: su texto puede ser
    // "Add to Cart" o "Sold Out", por eso usamos el id y no el nombre.
    this.addToCartButton = page.locator('#add');
    this.variantSelect = page.locator('#product-select-option-0');
    this.description = page.locator('#product-info');
    this.mainImage = page.locator('#feature-image');
    this.relatedProducts = new ProductGridComponent(page.locator('#related-products'));
  }

  /** Abre un producto por su handle, ej: open('grey-jacket'). */
  async open(handle: string): Promise<void> {
    this.path = `/products/${handle}`;
    await this.goto(); // método heredado de BasePage, usa `this.path`
  }

  async getPrice(): Promise<number> {
    return parsePrice(await this.price.innerText());
  }

  /**
   * Agrega el producto al carrito y ESPERA a que el servidor lo confirme.
   *
   * Patrón importante:
   *   1) Empezamos a "escuchar" la respuesta ANTES del click (si lo hacemos
   *      después, la respuesta podría llegar antes y nos la perderíamos).
   *   2) Hacemos click.
   *   3) Esperamos la respuesta que ya estábamos escuchando.
   */
  async addToCart(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (res) => res.url().includes('/cart/add') && res.request().method() === 'POST',
    );
    await this.addToCartButton.click();
    const response = await responsePromise;
    // Si el servidor devolvió error (ej. 422 por falta de stock), cortamos acá
    // con un mensaje claro en vez de fallar más adelante sin saber por qué.
    if (!response.ok()) {
      throw new Error(`Add to Cart falló: HTTP ${response.status()}`);
    }
  }
}
