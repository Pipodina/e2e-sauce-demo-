/**
 * ============================================================================
 *  pages/HomePage.ts  →  PAGE OBJECT DE LA HOME  ( / )
 * ============================================================================
 *  Es el Page Object más simple: muestra cómo una página HEREDA de BasePage.
 *
 *  Cadena de relaciones de este archivo:
 *    HomePage ──extends──► BasePage ──tiene──► HeaderComponent
 *    HomePage ──tiene────► ProductGridComponent (productos destacados)
 * ============================================================================
 */
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductGridComponent } from './components/ProductGridComponent';

// `extends BasePage` → HomePage recibe GRATIS: header, heading, breadcrumb,
// goto() y getTitle(). Solo agregamos lo que es propio de la Home.
export class HomePage extends BasePage {
  // Implementamos la propiedad abstracta que exige BasePage.
  protected readonly path = '/';

  readonly tagline: Locator;
  readonly featuredProducts: ProductGridComponent;

  constructor(page: Page) {
    // super(page) llama al constructor del PADRE (BasePage).
    // Es OBLIGATORIO y debe ir antes de usar `this`.
    super(page);
    this.tagline = page.locator('#tagline');
    this.featuredProducts = new ProductGridComponent(page.locator('#page-content .product-grid'));
  }
}
