/**
 * ============================================================================
 *  pages/ContentPages.ts  →  PÁGINAS DE CONTENIDO (About Us y Blog)
 * ============================================================================
 *  Un archivo puede exportar más de una clase. Lo hacemos acá porque son
 *  páginas chiquitas y parecidas. Cuando una crezca, conviene separarla.
 * ============================================================================
 */
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AboutUsPage extends BasePage {
  protected readonly path = '/pages/about-us';
  readonly content: Locator;

  constructor(page: Page) {
    super(page);
    this.content = page.locator('#page-content .wysiwyg');
  }
}

export class BlogPage extends BasePage {
  protected readonly path = '/blogs/news';
  readonly posts: Locator;

  constructor(page: Page) {
    super(page);
    this.posts = page.locator('article.post');
  }

  /** Título (link) de cada post. */
  postTitles(): Locator {
    return this.posts.locator('h2 a');
  }
}
