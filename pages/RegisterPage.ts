/**
 * ============================================================================
 *  pages/RegisterPage.ts  →  CREAR CUENTA  ( /account/register )
 * ============================================================================
 *  Caso real de "por qué a veces NO se puede usar getByLabel":
 *  en esta web el <label for="email"> apunta a id="email", pero hay DOS
 *  elementos con ese id (un <div> y el <input>). El HTML está mal formado y
 *  el label queda asociado al <div>. Solución: usar el atributo `name` del
 *  input, que es único y es lo que el servidor recibe.
 * ============================================================================
 */
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { UserData } from '../test-data/users';

export class RegisterPage extends BasePage {
  protected readonly path = '/account/register';

  readonly form: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('#create_customer');
    this.firstNameInput = this.form.locator('input[name="customer[first_name]"]');
    this.lastNameInput = this.form.locator('input[name="customer[last_name]"]');
    this.emailInput = this.form.locator('input[name="customer[email]"]');
    this.passwordInput = this.form.locator('input[name="customer[password]"]');
    this.createButton = this.form.getByRole('button', { name: 'Create' });
  }

  /**
   * Completa el formulario con un objeto UserData.
   * Recibir UN objeto (en vez de 4 parámetros sueltos) hace que el test sea
   * más legible:  fillForm(buildUser())  vs  fillForm('Ana','T','a@b.com','x')
   */
  async fillForm(user: UserData): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
  }
}
