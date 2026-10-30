/**
 * ============================================================================
 *  tests/08-register.spec.ts  →  CREAR CUENTA
 * ============================================================================
 *  Conceptos nuevos:
 *    - Usar una FACTORY de datos (buildUser) para no repetir datos.
 *    - Pisar un solo campo con overrides: buildUser({ email: 'malo' })
 *    - Validar el formulario completo con un objeto.
 *
 *  No hacemos click en "Create": crearía cuentas reales en una tienda pública
 *  (y también tiene hCaptcha). Probamos todo lo que podemos SIN efectos
 *  secundarios. Regla de oro: los tests no deben ensuciar sistemas ajenos.
 * ============================================================================
 */
import { test, expect } from '../fixtures/pages.fixture';
import { buildUser } from '../test-data/users';

test.describe('Registro', () => {
  test.beforeEach(async ({ registerPage }) => {
    await registerPage.goto();
  });

  test('muestra todos los campos del formulario', { tag: '@smoke' }, async ({ registerPage }) => {
    await expect(registerPage.heading).toHaveText('Create Account');

    // Guardamos los locators en un array para verificarlos en un loop.
    const fields = [
      registerPage.firstNameInput,
      registerPage.lastNameInput,
      registerPage.emailInput,
      registerPage.passwordInput,
    ];
    for (const field of fields) {
      await expect(field).toBeVisible();
      await expect(field).toBeEditable(); // se puede escribir
      await expect(field).toBeEmpty();    // arranca vacío
    }
    await expect(registerPage.createButton).toBeEnabled();
  });

  test('cada campo tiene su label visible', async ({ registerPage }) => {
    for (const label of ['First Name', 'Last Name', 'Email Address', 'Password']) {
      await expect(registerPage.form.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('completa el formulario con datos válidos', async ({ registerPage }) => {
    const user = buildUser(); // email único: ana.tester.<timestamp>@example.com
    await registerPage.fillForm(user);

    await expect(registerPage.firstNameInput).toHaveValue(user.firstName);
    await expect(registerPage.lastNameInput).toHaveValue(user.lastName);
    await expect(registerPage.emailInput).toHaveValue(user.email);
    await expect(registerPage.passwordInput).toHaveValue(user.password);
  });

  test('el password está oculto', async ({ registerPage }) => {
    await expect(registerPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('un email inválido no pasa la validación del navegador', async ({ registerPage }) => {
    // Solo cambiamos el email; el resto del usuario sigue siendo válido.
    // Así el test prueba UNA cosa: el email.
    await registerPage.fillForm(buildUser({ email: 'email-sin-arroba' }));

    // checkValidity() devuelve true/false y es lo que el navegador usa para
    // bloquear el envío del formulario.
    const formIsValid = await registerPage.form.evaluate((form) => (form as HTMLFormElement).checkValidity());
    expect(formIsValid).toBe(false);

    // validationMessage es el texto del globito que muestra el navegador.
    const message = await registerPage.emailInput.evaluate((el) => (el as HTMLInputElement).validationMessage);
    expect(message).not.toBe('');
  });

  test('con datos válidos el formulario pasa la validación del navegador', async ({ registerPage }) => {
    await registerPage.fillForm(buildUser());
    const formIsValid = await registerPage.form.evaluate((form) => (form as HTMLFormElement).checkValidity());
    expect(formIsValid).toBe(true);
  });

  test('desde registro se puede ir al login por el header', async ({ registerPage, loginPage, page }) => {
    await registerPage.header.goToLogin();
    await expect(page).toHaveURL(/\/account\/login/);
    await expect(loginPage.heading).toHaveText('Customer Login');
  });
});
