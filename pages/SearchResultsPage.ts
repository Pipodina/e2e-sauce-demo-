/**
 * ============================================================================
 *  pages/SearchResultsPage.ts  →  RESULTADOS DE BÚSQUEDA  ( /search?q=... )
 * ============================================================================
 *  Dos formas de llegar acá:
 *    a) Como usuario: header.search('jacket')   → lo usamos en tests de UI
 *    b) Directo por URL: searchFor('jacket')     → más rápido, para preparar
 * ============================================================================
 */
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductGridComponent } from './components/ProductGridComponent';

export class SearchResultsPage extends BasePage {
  protected readonly path = '/search';

  readonly keywordMessage: Locator; // "Showing results for jacket" / "No results found for x"
  readonly results: ProductGridComponent;

  constructor(page: Page) {
    super(page);
    this.keywordMessage = page.locator('#keyword');
    this.results = new ProductGridComponent(page.locator('#page-content'));
  }

  /** Navega directo a la URL de búsqueda. */
  async searchFor(term: string): Promise<void> {
    // encodeURIComponent convierte espacios y símbolos en formato URL seguro:
    // "grey jacket" → "grey%20jacket"
    await this.page.goto(`${this.path}?type=product&q=${encodeURIComponent(term)}`);
  }
}
