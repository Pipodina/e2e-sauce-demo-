/**
 * ============================================================================
 *  tests/02-navigation.spec.ts  →  NAVEGACIÓN ENTRE PÁGINAS
 * ============================================================================
 *  Conceptos nuevos:
 *    - toHaveURL con texto y con expresiones regulares
 *    - TESTS PARAMETRIZADOS: un for que genera un test por cada dato
 *    - Usar varios Page Objects en el mismo test
 * ============================================================================
 */
import { test, expect } from '../fixtures/pages.fixture';

test.describe('Navegación', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // ── Test parametrizado (data-driven) ──────────────────────────────────────
  // En vez de escribir 3 tests casi iguales, armamos una tabla de datos y
  // generamos un test por fila. Si mañana hay un menú nuevo, agregás una línea.
  //
  // `as const` hace que TypeScript sepa que option es exactamente
  // 'Catalog' | 'Blog' | 'About Us' (lo que exige header.goToMenu()).
  const menuCases = [
    { option: 'Catalog', url: /\/collections\/all$/, heading: 'Products' },
    { option: 'Blog', url: /\/blogs\/news$/, heading: null },
    { option: 'About Us', url: /\/pages\/about-us$/, heading: 'About Us' },
  ] as const;

  for (const { option, url, heading } of menuCases) {
    // El nombre del test incluye el dato → cada uno es identificable en el reporte.
    test(`menú lateral "${option}" lleva a su página`, async ({ homePage, page }) => {
      await homePage.header.goToMenu(option);

      // Regex (/.../): verifica que la URL TERMINE en esa ruta ($ = fin).
      // Usamos regex para no depender del dominio completo.
      await expect(page).toHaveURL(url);

      if (heading) {
        // homePage.heading sigue funcionando en la página nueva porque es un
        // Locator ("receta"): se vuelve a buscar en lo que haya en la pestaña.
        await expect(homePage.heading).toHaveText(heading);
      }
    });
  }

  test('el link "Log In" del header abre el login', async ({ homePage, loginPage, page }) => {
    await homePage.header.goToLogin();
    await expect(page).toHaveURL(/\/account\/login/);
    // Usamos OTRO Page Object para verificar la página de destino.
    await expect(loginPage.heading).toHaveText('Customer Login');
  });

  test('el link "Sign up" del header abre el registro', async ({ homePage, registerPage, page }) => {
    await homePage.header.goToSignUp();
    await expect(page).toHaveURL(/\/account\/register/);
    await expect(registerPage.heading).toHaveText('Create Account');
  });

  test('el logo vuelve a la home desde otra página', async ({ catalogPage, page }) => {
    await catalogPage.goto();
    await catalogPage.header.logo.click();
    // toHaveURL con string: se compara contra la URL completa (baseURL + '/').
    await expect(page).toHaveURL('/');
  });

  test('el breadcrumb permite volver a Home', async ({ aboutUsPage, page }) => {
    await aboutUsPage.goto();
    await expect(aboutUsPage.breadcrumb).toContainText('About Us');
    await aboutUsPage.breadcrumb.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
  });

  test('About Us muestra contenido', async ({ aboutUsPage }) => {
    await aboutUsPage.goto();
    await expect(aboutUsPage.content).toContainText('This is a demo site created for');
  });

  test('el Blog muestra al menos un post', async ({ blogPage }) => {
    await blogPage.goto();
    // No sabemos cuántos posts habrá en el futuro: verificamos "al menos uno".
    // .first() toma el primer elemento de la lista.
    await expect(blogPage.posts.first()).toBeVisible();
    await expect(blogPage.postTitles().first()).toHaveText('First Post');
  });
});
