/**
 * ============================================================================
 *  test-data/users.ts  →  DATOS DE USUARIOS
 * ============================================================================
 *  Dos ideas importantes:
 *
 *  1) Datos FIJOS (constantes) para casos conocidos: un email inválido, etc.
 *  2) Datos GENERADOS (funciones "factory") cuando cada ejecución necesita
 *     algo único. Ejemplo: un email nuevo para registrarse, porque si usás
 *     siempre el mismo, la segunda vez falla con "ya existe".
 *
 *  IMPORTANTE: nunca pongas credenciales reales en el código. Si algún día
 *  necesitás un usuario real, leelo de variables de entorno:
 *      process.env.SAUCE_USER_EMAIL
 * ============================================================================
 */

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Factory: cada llamada devuelve un usuario distinto gracias a Date.now().
// El parámetro `overrides` permite pisar solo lo que te interesa:
//   buildUser({ email: 'malo' })  → usuario válido salvo el email.
// `Partial<UserData>` = "un UserData donde todas las propiedades son opcionales".
export function buildUser(overrides: Partial<UserData> = {}): UserData {
  const unique = Date.now();
  return {
    firstName: 'Ana',
    lastName: 'Tester',
    email: `ana.tester.${unique}@example.com`,
    password: 'Qa-Password-123!',
    ...overrides, // "spread": copia las propiedades de overrides encima de las anteriores
  };
}

// Emails con formato inválido para probar la validación del navegador.
export const INVALID_EMAILS = ['sin-arroba.com', 'usuario@', '@dominio.com', 'con espacio@mail.com'];
