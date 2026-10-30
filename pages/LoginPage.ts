/**
 * ============================================================================
 *  pages/LoginPage.ts  →  LOGIN Y RECUPERAR CONTRASEÑA  ( /account/login )
 * ============================================================================
 *  Esta página tiene DOS formularios y solo uno se ve a la vez:
 *    - "Customer Login"   (visible al entrar)
 *    - "Reset Password"   (aparece al tocar "Forgot your password?")
 *  Modelamos ambos en el mismo Page Object porque viven en la misma URL.
 * ============================================================================
 */
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  protected readonly path = '/account/login';

  // Formulario de login
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly forgotPasswordLink: Locator;

  // Formulario de recuperación
  readonly recoverForm: Locator;
  readonly recoverEmailInput: Locator;
  readonly recoverSubmitButton: Locator;
  readonly recoverCancelLink: Locator;

  constructor(page: Page) {
    super(page);
    // getByLabel: busca el input asociado al <label for="..."> con ese texto.
    // Es el selector preferido para formularios: si el label es accesible
    // para un usuario, también lo es para el test.
    this.loginForm = page.locator('#customer');
    this.emailInput = page.getByLabel('Email Address', { exact: true });
    this.passwordInput = page.getByLabel('Password', { exact: true });
    // Un <input type="submit"> tiene rol "button" y su nombre es su value.
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot your password?' });

    this.recoverForm = page.locator('#recover-password');
    // Acá NO sirve getByLabel: el <label for="email"> apunta a un id que no es
    // el del input (id="recover-email"). Es un bug de accesibilidad de la web;
    // usamos el id directamente.
    this.recoverEmailInput = page.locator('#recover-email');
    this.recoverSubmitButton = this.recoverForm.getByRole('button', { name: 'Submit' });
    this.recoverCancelLink = this.recoverForm.getByRole('link', { name: 'Cancel' });
  }

  /** Completa email y password (sin enviar). */
  async fillCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async openRecoverPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async cancelRecoverPassword(): Promise<void> {
    await this.recoverCancelLink.click();
  }
}
