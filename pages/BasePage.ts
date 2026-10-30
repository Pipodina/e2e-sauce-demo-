/**
 * ============================================================================
 *  pages/BasePage.ts  →  LA CLASE "PADRE" DE TODAS LAS PÁGINAS
 * ============================================================================
 *  ¿Qué es POM (Page Object Model)?
 *    Un patrón de diseño donde CADA PÁGINA de la web se representa con una
 *    CLASE. Esa clase guarda:
 *      - los LOCATORS (cómo encontrar los elementos de esa página)
 *      - las ACCIONES (qué puede hacer el usuario en esa página)
 *
 *    Los TESTS no tocan selectores: solo llaman métodos del Page Object.
 *    Si un dev cambia un id en la web, arreglás UN Page Object, no 30 tests.
 *
 *  ¿Por qué una BasePage?
 *    Todas las páginas comparten cosas: tienen `page`, tienen header, tienen
 *    breadcrumb, tienen un <h1>, se navega a ellas con una URL. En lugar de
 *    repetir ese código, lo escribimos UNA vez acá y las demás lo HEREDAN con
 *    `extends BasePage`.
 *
 *  `abstract` = esta clase no se puede usar sola (`new BasePage()` da error).
 *  Solo existe para que otras hereden de ella.
 * ============================================================================
 */
import type { Locator, Page } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent';

export abstract class BasePage {
  // `protected` = accesible desde esta clase y sus hijas, pero no desde los tests.
  // Lo usamos para `page` porque queremos que los tests usen los MÉTODOS del
  // Page Object y no la `page` cruda (así no se saltean el patrón).
  // Para casos puntuales (ej: chequear la URL) los tests reciben su propia `page`.
  protected readonly page: Page;

  // Composición: cada página "tiene un" header.
  readonly header: HeaderComponent;

  readonly heading: Locator;    // el <h1> principal de la página
  readonly breadcrumb: Locator; // "Home — Products"

  /**
   * Cada página hija DEBE decir cuál es su URL relativa.
   * `abstract` en una propiedad obliga a las hijas a definirla.
   * Si creás una página nueva y te olvidás, TypeScript te avisa.
   * (No es `readonly` porque ProductPage necesita cambiarla según el producto.)
   */
  protected abstract path: string;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page); // le pasamos la MISMA page
    // Hay <h1> en el logo y en el contenido; acotamos al contenido principal.
    this.heading = page.locator('#page-content h1').first();
    this.breadcrumb = page.locator('#breadcrumb');
  }

  /**
   * Navega a la página. Como usa `this.path`, cada hija navega a SU url
   * sin tener que escribir su propio método goto().
   *   homePage.goto()    → '/'
   *   cartPage.goto()    → '/cart'
   * La URL completa se arma con la baseURL de playwright.config.ts.
   */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Título de la pestaña del navegador (<title>). */
  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
