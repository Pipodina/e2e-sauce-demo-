/**
 * ============================================================================
 *  pages/CatalogPage.ts  →  PAGE OBJECT DEL CATÁLOGO  ( /collections/all )
 * ============================================================================
 *  Reutiliza ProductGridComponent: la lógica de "leer productos de una grilla"
 *  está escrita una sola vez y la comparten Home, Catálogo y Búsqueda.
 * ============================================================================
 */
import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductGridComponent } from './components/ProductGridComponent';

export class CatalogPage extends BasePage {
  protected readonly path = '/collections/all';

  readonly grid: ProductGridComponent;

  constructor(page: Page) {
    super(page);
    this.grid = new ProductGridComponent(page.locator('#page-content .product-grid'));
  }

  /** Atajo con nombre de negocio: delega en el componente. */
  async openProduct(name: string): Promise<void> {
    await this.grid.open(name);
  }
}
