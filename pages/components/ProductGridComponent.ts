/**
 * ============================================================================
 *  pages/components/ProductGridComponent.ts  →  OTRO COMPONENTE REUTILIZABLE
 * ============================================================================
 *  La "grilla de productos" (imagen + nombre + precio) aparece en:
 *    - la Home (productos destacados)
 *    - el Catálogo (todos los productos)
 *    - los Resultados de búsqueda
 *    - "You Might Also Like..." dentro de un producto
 *
 *  Por eso NO pertenece a una sola página. Cada página que la necesita crea
 *  su propia instancia pasándole su contenedor (`root`).
 *
 *  Concepto clave: LOCATOR ENCADENADO (scoping)
 *    root.locator('a')  → busca los <a> SOLO dentro del root, no en toda la web.
 * ============================================================================
 */
import type { Locator } from '@playwright/test';
import { parsePrice } from '../../utils/price';

// Tipo que devuelve getProducts(): una "foto" de lo que se ve en la grilla.
export interface GridProduct {
  name: string;
  price: number;
  soldOut: boolean;
}

export class ProductGridComponent {
  readonly items: Locator;

  // Recibe un Locator (no una Page): el contenedor de ESTA grilla.
  constructor(private readonly root: Locator) {
    // Cada producto es un <a id="product-1">, <a id="product-2">...
    // [id^="product-"] = CSS "id que EMPIEZA con product-"
    this.items = root.locator('a[id^="product-"]');
  }

  /** Locator de UN producto por su nombre. filter() achica una lista de elementos. */
  item(name: string): Locator {
    return this.items.filter({
      has: this.root.page().getByRole('heading', { name, exact: true }),
    });
  }

  /** Nombres de todos los productos visibles, en orden. */
  async getNames(): Promise<string[]> {
    // allInnerTexts() devuelve un array con el texto de TODOS los elementos.
    return this.items.locator('h3').allInnerTexts();
  }

  /**
   * Lee la grilla completa y la convierte en datos (array de objetos).
   * Útil para comparar con lo esperado en test-data/products.ts.
   */
  async getProducts(): Promise<GridProduct[]> {
    const count = await this.items.count(); // cuántos elementos hay AHORA
    const products: GridProduct[] = [];
    for (let i = 0; i < count; i++) {
      const item = this.items.nth(i); // nth(i) = el elemento en la posición i
      products.push({
        name: await item.locator('h3').innerText(),
        price: parsePrice(await item.locator('h4').innerText()),
        // count() > 0 → existe el cartel "Sold Out" dentro de ESTE producto
        soldOut: (await item.locator('.sold-out').count()) > 0,
      });
    }
    return products;
  }

  /** Abre un producto haciendo click en su tarjeta. */
  async open(name: string): Promise<void> {
    await this.item(name).click();
  }
}
