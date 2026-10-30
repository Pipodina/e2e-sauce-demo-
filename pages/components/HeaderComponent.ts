/**
 * ============================================================================
 *  pages/components/HeaderComponent.ts  →  UN "COMPONENTE" (no es una página)
 * ============================================================================
 *  El header (buscador, "Log In", "Sign up", "My Cart (0)", "Check Out") y el
 *  menú lateral (Home, Catalog, Blog, About Us) aparecen en TODAS las páginas.
 *
 *  Si pusiéramos esos locators en HomePage, CartPage, ProductPage... estarían
 *  repetidos 8 veces. En vez de eso, los ponemos en UN componente y lo
 *  "componemos" dentro de BasePage. Esto se llama COMPOSICIÓN:
 *
 *      BasePage  ──tiene un──►  HeaderComponent
 *         ▲
 *         │ (herencia: "es un")
 *      HomePage, CartPage, ProductPage...
 *
 *  Resultado: desde CUALQUIER página podés hacer  `cartPage.header.search('x')`
 * ============================================================================
 */

// Importamos TIPOS desde Playwright:
//  - Page:    representa una pestaña del navegador.
//  - Locator: una "receta" para encontrar un elemento (NO el elemento en sí).
// `import type` aclara que solo se usan como tipos (no generan código JS).
import type { Locator, Page } from '@playwright/test';

export class HeaderComponent {
  // ── LOCATORS ──────────────────────────────────────────────────────────────
  // `readonly` = se asignan una vez en el constructor y no se pueden cambiar.
  // Un Locator es PEREZOSO (lazy): definirlo no busca nada en la página.
  // La búsqueda ocurre recién cuando hacés una acción (click) o un expect.
  // Por eso podemos definirlos todos en el constructor sin problema.
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly loginLink: Locator;
  readonly signUpLink: Locator;
  readonly cartCount: Locator;
  readonly checkoutLink: Locator;
  readonly sidebarMenu: Locator;

  // El constructor recibe la `page` desde afuera (de BasePage).
  // `private readonly page: Page` es un atajo de TypeScript: declara la
  // propiedad this.page y la asigna en una sola línea.
  constructor(private readonly page: Page) {
    // ¿Cómo elegir un buen selector? Orden de preferencia recomendado:
    //   1. getByRole  (como lo "ve" un usuario o lector de pantalla)
    //   2. getByLabel / getByPlaceholder / getByText
    //   3. getByTestId (si los devs agregan data-testid)
    //   4. CSS / id   (cuando no hay otra opción estable)

    // getByRole('img', { name }) → busca una imagen por su texto alternativo (alt).
    this.logo = page.getByRole('img', { name: 'Sauce Demo' });

    // getByPlaceholder → el input que muestra "Search" como texto gris.
    this.searchInput = page.getByPlaceholder('Search');

    // OJO: la web tiene DOS links "Log In" con el mismo id (uno desktop y uno
    // mobile oculto). Si buscáramos por id, Playwright encontraría 2 elementos
    // y fallaría en "strict mode" (no sabe a cuál hacer click).
    // Solución: ACOTAR la búsqueda dentro del <header>.
    //   page.locator('header')  → el contenedor
    //   .getByRole('link', ...) → busca el link SOLO dentro de ese contenedor
    // `exact: true` evita que "Log In" matchee también "Log In with Shop", etc.
    const headerNav = page.locator('header nav');
    this.loginLink = headerNav.getByRole('link', { name: 'Log In', exact: true });
    this.signUpLink = headerNav.getByRole('link', { name: 'Sign up', exact: true });

    // Acá sí usamos id: el contador "(0)" no tiene rol ni label propio.
    this.cartCount = page.locator('#cart-target-desktop');
    this.checkoutLink = page.locator('#minicart').getByRole('link', { name: 'Check Out' });

    this.sidebarMenu = page.locator('#main-menu');
  }

  // ── ACCIONES ──────────────────────────────────────────────────────────────
  // Los métodos representan lo que un USUARIO hace, con nombres de negocio.
  // El test dice "header.search('jacket')", no "fill + press Enter".

  /** Escribe un término en el buscador y presiona Enter. */
  async search(term: string): Promise<void> {
    // `async/await`: cada acción del navegador es asíncrona (tarda un tiempo).
    // `await` espera a que termine antes de seguir con la línea siguiente.
    // Si te olvidás un `await`, el test sigue de largo y falla de forma rara.
    await this.searchInput.fill(term); // fill() borra el contenido y escribe
    await this.searchInput.press('Enter');
  }

  /**
   * Hace click en una opción del menú lateral.
   * El tipo del parámetro es una UNIÓN de strings: TypeScript solo acepta
   * esos 4 valores. Si escribís goToMenu('Catalogo') → error en el editor.
   */
  async goToMenu(option: 'Home' | 'Catalog' | 'Blog' | 'About Us'): Promise<void> {
    await this.sidebarMenu.getByRole('link', { name: option, exact: true }).click();
  }

  async goToLogin(): Promise<void> {
    await this.loginLink.click();
  }

  async goToSignUp(): Promise<void> {
    await this.signUpLink.click();
  }

  async goToCheckout(): Promise<void> {
    await this.checkoutLink.click();
  }

  /** Lee el número del carrito: "(3)" → 3 */
  async getCartCount(): Promise<number> {
    const text = await this.cartCount.innerText(); // innerText() lee el texto visible
    return Number(text.replace(/\D/g, ''));         // \D = todo lo que NO es dígito
  }
}
