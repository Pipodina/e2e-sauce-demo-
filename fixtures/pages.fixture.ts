/**
 * ============================================================================
 *  fixtures/pages.fixture.ts  →  EL "PEGAMENTO" ENTRE TESTS Y PAGE OBJECTS
 * ============================================================================
 *  ¿Qué es un FIXTURE?
 *    Es algo que Playwright PREPARA y le ENTREGA al test antes de que arranque.
 *    Ya usás fixtures sin saberlo: `page`, `request`, `context` son fixtures
 *    que trae Playwright.
 *
 *        test('mi test', async ({ page }) => { ... })
 *                                 ▲
 *                     Playwright crea la `page` y te la pasa
 *
 *  Acá CREAMOS NUESTROS PROPIOS fixtures: homePage, cartPage, productPage...
 *  Así los tests NO tienen que hacer `new CartPage(page)` en cada test:
 *
 *    SIN fixture:
 *      test('x', async ({ page }) => {
 *        const cartPage = new CartPage(page);
 *        const productPage = new ProductPage(page);
 *        ...
 *      });
 *
 *    CON fixture:
 *      test('x', async ({ cartPage, productPage }) => { ... });
 *
 *  Además, Playwright solo crea los fixtures que el test PIDE (lazy):
 *  si el test pide solo `cartPage`, no se crea `loginPage`.
 *
 *  ┌───────────────── CÓMO SE CONECTA TODO ─────────────────┐
 *  │ playwright.config.ts  → baseURL, navegador, timeouts    │
 *  │          │ (Playwright lo aplica a cada `page`)         │
 *  │          ▼                                              │
 *  │ fixtures/pages.fixture.ts  → crea Page Objects con esa  │
 *  │          │                   `page` y exporta `test`    │
 *  │          ▼                                              │
 *  │ tests/*.spec.ts  → importan `test` y `expect` DE ACÁ    │
 *  │          │         (no de @playwright/test)             │
 *  │          ▼                                              │
 *  │ pages/*.ts  → locators + acciones                       │
 *  │ test-data/*.ts, utils/*.ts → datos y helpers            │
 *  └─────────────────────────────────────────────────────────┘
 * ============================================================================
 */
import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AboutUsPage, BlogPage } from '../pages/ContentPages';

// 1) Declaramos el TIPO de nuestros fixtures: nombre → clase.
type PageFixtures = {
  homePage: HomePage;
  catalogPage: CatalogPage;
  productPage: ProductPage;
  cartPage: CartPage;
  searchResultsPage: SearchResultsPage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  aboutUsPage: AboutUsPage;
  blogPage: BlogPage;
};

// 2) `base.extend<...>()` crea un NUEVO `test` que tiene todo lo de Playwright
//    MÁS nuestros fixtures.
export const test = base.extend<PageFixtures>({
  // Cada fixture es una función con la forma:
  //   async ({ fixturesQueNecesito }, use) => { preparar; await use(valor); limpiar; }
  //
  // - Pide `page` (el fixture original de Playwright).
  // - Crea el Page Object.
  // - `use(...)` se lo ENTREGA al test. El test corre "dentro" del use().
  // - Lo que pongas DESPUÉS de `await use()` corre cuando el test termina
  //   (teardown / limpieza). Acá no hace falta: cada test usa un navegador
  //   nuevo y se descarta solo.
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  aboutUsPage: async ({ page }, use) => {
    await use(new AboutUsPage(page));
  },
  blogPage: async ({ page }, use) => {
    await use(new BlogPage(page));
  },
});

// 3) Re-exportamos `expect` para que los tests importen TODO de un solo lugar:
//      import { test, expect } from '../fixtures/pages.fixture';
export { expect };
