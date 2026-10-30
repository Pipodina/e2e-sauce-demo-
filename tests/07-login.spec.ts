/**
 * ============================================================================
 *  tests/07-login.spec.ts  →  LOGIN Y RECUPERAR CONTRASEÑA
 * ============================================================================
 *  Conceptos nuevos:
 *    - Mostrar / ocultar secciones (toBeVisible / toBeHidden)
 *    - Atributos de seguridad: el password debe ser type="password"
 *    - Validación nativa del navegador (HTML5) con locator.evaluate()
 *
 *  ¿Por qué NO enviamos el login con credenciales?
 *    Shopify protege el formulario con hCaptcha. Automatizar el envío contra
 *    una tienda pública es poco confiable (el captcha puede aparecer) y
 *    además no tenemos un usuario de prueba. En un proyecto real se pide al
 *    equipo un ambiente de test con el captcha desactivado.
 * ============================================================================
 */
import { test, expect } from '../fixtures/pages.fixture';
import { INVALID_EMAILS } from '../test-data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('muestra el formulario de login', { tag: '@smoke' }, async ({ loginPage }) => {
    await expect(loginPage.heading).toHaveText('Customer Login');
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.signInButton).toBeEnabled();
  });

  test('el password se oculta y el email usa type="email"', async ({ loginPage }) => {
    // Seguridad básica: si el input fuera type="text", la contraseña se vería.
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
  });

  test('los campos aceptan lo que escribe el usuario', async ({ loginPage }) => {
    await loginPage.fillCredentials('qa@example.com', 'secreto');
    await expect(loginPage.emailInput).toHaveValue('qa@example.com');
    await expect(loginPage.passwordInput).toHaveValue('secreto');
  });

  // Parametrizado sobre los emails inválidos de test-data/users.ts
  for (const email of INVALID_EMAILS) {
    test(`el navegador marca como inválido el email "${email}"`, async ({ loginPage }) => {
      await loginPage.emailInput.fill(email);

      // evaluate() ejecuta código DENTRO del navegador, sobre el elemento real.
      // `validity.valid` es una API del navegador que dice si el input pasa
      // la validación HTML5 (en este caso, formato de email).
      const isValid = await loginPage.emailInput.evaluate((el) => (el as HTMLInputElement).validity.valid);
      expect(isValid).toBe(false);
    });
  }

  test('un email bien formado es válido', async ({ loginPage }) => {
    await loginPage.emailInput.fill('qa@example.com');
    const isValid = await loginPage.emailInput.evaluate((el) => (el as HTMLInputElement).validity.valid);
    expect(isValid).toBe(true);
  });

  test.describe('Recuperar contraseña', () => {
    // describe anidado: hereda el beforeEach de arriba (ir a /account/login)
    // y suma el suyo propio (abrir el formulario de recuperación).
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.openRecoverPassword();
    });

    test('"Forgot your password?" muestra el formulario de recuperación', async ({ loginPage }) => {
      await expect(loginPage.recoverForm).toBeVisible();
      await expect(loginPage.recoverForm.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
      // toBeHidden: el elemento existe pero no se ve (display:none).
      await expect(loginPage.loginForm).toBeHidden();
      await expect(loginPage.recoverEmailInput).toBeVisible();
      await expect(loginPage.recoverSubmitButton).toBeVisible();
    });

    test('"Cancel" vuelve al formulario de login', async ({ loginPage }) => {
      await loginPage.cancelRecoverPassword();
      await expect(loginPage.loginForm).toBeVisible();
      await expect(loginPage.recoverForm).toBeHidden();
    });
  });
});
