/**
 * ============================================================================
 *  playwright.config.ts  →  EL "CEREBRO" DEL PROYECTO
 * ============================================================================
 *  Cuando corrés `npx playwright test`, lo PRIMERO que hace Playwright es leer
 *  este archivo. Acá se define:
 *    - DÓNDE están los tests          (testDir)
 *    - CONTRA QUÉ web corren          (baseURL)
 *    - EN QUÉ navegadores             (projects)
 *    - CUÁNTO esperar antes de fallar (timeouts)
 *    - QUÉ guardar cuando algo falla  (screenshots, videos, traces)
 *    - CÓMO mostrar resultados        (reporter)
 *
 *  Ningún test importa este archivo: Playwright lo aplica automáticamente a
 *  todos. Por eso, si cambiás la baseURL acá, cambia para TODOS los tests.
 * ============================================================================
 */
import { defineConfig, devices } from '@playwright/test';
import * as os from 'node:os'; // módulo de Node para leer datos del sistema operativo

// defineConfig() no hace "magia": solo te da autocompletado y chequeo de tipos
// de TypeScript para que no escribas mal ninguna opción.
export default defineConfig({
  // Carpeta donde Playwright busca archivos *.spec.ts para ejecutar.
  testDir: './tests',

  // Los tests de distintos archivos Y del mismo archivo corren en paralelo.
  // Esto funciona porque cada test recibe su propio navegador "limpio"
  // (un BrowserContext nuevo: sin cookies, sin carrito, sin sesión).
  fullyParallel: true,

  // Si alguien deja un `test.only` olvidado, en CI (integración continua) falla
  // el build. Evita que se suba código que corre un solo test.
  forbidOnly: !!process.env.CI,

  // Reintentos: en local 0 (queremos ver el fallo real), en CI 2.
  retries: process.env.CI ? 2 : 0,

  // Cantidad de "workers" (procesos en paralelo). Es una tienda pública de
  // Shopify: no conviene bombardearla, así que limitamos a 4.
  workers: process.env.CI ? 1 : 4,

  // Reporters: cómo se muestran los resultados.
  //  - 'list' → imprime cada test en la consola.
  //  - 'html' → genera un reporte navegable en /playwright-report
  //             (lo abrís con `npm run report`).
  //  - 'allure-playwright' → guarda los resultados crudos en /allure-results.
  //             Después `npm run allure` arma el reporte con gráficos
  //             (su configuración está en allurerc.mjs).
  // Se pueden usar varios reporters a la vez: cada uno genera su salida.
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        // Info del ambiente que se muestra en la portada del reporte.
        environmentInfo: {
          url: 'https://sauce-demo.myshopify.com',
          navegador: 'Chromium',
          sistema: `${os.platform()} ${os.release()}`,
          node: process.version,
        },
      },
    ],
  ],

  // Tiempo máximo que puede durar UN test completo.
  timeout: 60_000,

  // Tiempo máximo que un `expect(...)` reintenta antes de fallar.
  // (Las aserciones de Playwright REINTENTAN solas hasta cumplirse; esto
  // es clave y lo vas a ver comentado en los tests.)
  expect: { timeout: 10_000 },

  // `use` = opciones que se le pasan a CADA test (a su `page`, `request`, etc.).
  use: {
    // Con baseURL, en el código escribimos `page.goto('/cart')` en vez de la
    // URL completa. Si mañana la web cambia de dominio, se cambia SOLO acá.
    baseURL: 'https://sauce-demo.myshopify.com',

    // Evidencias para depurar fallos (se ven en el reporte HTML):
    trace: 'retain-on-failure', // "película" paso a paso: DOM, red, consola
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Cuánto puede tardar una acción (click, fill...) o una navegación.
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  // "projects" = en qué navegadores/dispositivos correr la MISMA suite.
  // Para sumar Firefox: `npx playwright install firefox` y descomentá abajo.
  projects: [
    {
      name: 'chromium',
      // devices[...] trae viewport, userAgent, etc. ya configurados.
      // Usamos escritorio porque la web oculta partes del header en mobile.
      use: { ...devices['Desktop Chrome'] },
    },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
