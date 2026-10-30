/**
 * ============================================================================
 *  utils/price.ts  →  FUNCIONES DE AYUDA (helpers) reutilizables
 * ============================================================================
 *  La web muestra precios como TEXTO: "£55.00 " o "Total £180.00".
 *  Para comparar o sumar necesitamos NÚMEROS. Esta función convierte uno en otro.
 *
 *  ¿Por qué en /utils y no dentro de un Page Object?
 *    Porque no depende de ninguna página: es lógica pura y la usan varias
 *    (CatalogPage, ProductPage, CartPage). Si la pusieras en una sola página,
 *    las demás tendrían que importar esa página solo para usar esta función.
 * ============================================================================
 */

/** Convierte "£1,234.50" / "Total £55.00" → 1234.5 */
export function parsePrice(text: string): number {
  // Expresión regular: busca el primer número con decimales opcionales,
  // permitiendo comas de miles. Ej: "Total £1,180.00" → "1,180.00"
  const match = text.match(/\d[\d,]*(\.\d+)?/);
  if (!match) {
    // Fallar con un mensaje claro ahorra mucho tiempo al depurar.
    throw new Error(`No se encontró un precio en el texto: "${text}"`);
  }
  return Number(match[0].replace(/,/g, ''));
}

/** Formatea 55 → "£55.00" (tal como lo muestra la web). */
export function formatPrice(value: number): string {
  return `£${value.toFixed(2)}`;
}
