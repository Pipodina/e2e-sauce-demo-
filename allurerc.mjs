/**
 * ============================================================================
 *  allurerc.mjs  →  CONFIGURACIÓN DE ALLURE REPORT 3
 * ============================================================================
 *  Allure trabaja en DOS etapas:
 *
 *   1) Mientras corren los tests, el reporter `allure-playwright` (configurado
 *      en playwright.config.ts) guarda RESULTADOS CRUDOS en ./allure-results
 *      (un .json por test + capturas, videos y traces).
 *
 *   2) El comando `allure generate` lee esos resultados y arma el REPORTE HTML
 *      en ./allure-report, usando la configuración de ESTE archivo.
 *
 *  Este archivo es .mjs (JavaScript con módulos ES) porque así lo pide la
 *  CLI de Allure 3. Lo lee la CLI de Allure, no Playwright.
 * ============================================================================
 */
import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Sauce Demo - Playwright + POM',
  output: './allure-report',

  // HISTORIAL: cada `allure generate` agrega una línea a este archivo.
  // Con eso el reporte muestra TENDENCIAS (cómo evolucionaron los resultados
  // corrida tras corrida) y detecta tests inestables ("flaky").
  historyPath: './allure-history/history.jsonl',
  historyLimit: 20, // guardamos las últimas 20 corridas

  plugins: {
    // "awesome" es la interfaz nueva de Allure 3 (gráficos, filtros, árbol).
    awesome: {
      options: {
        reportName: 'Sauce Demo - Reporte de tests',
        reportLanguage: 'es',
        // singleFile: true → todo en UN index.html que podés mandar por mail.
        // Lo dejamos en false para que cargue más rápido con videos y traces.
        singleFile: false,
        theme: 'auto', // claro u oscuro según tu sistema
        // Cómo se agrupa el árbol de tests de la izquierda.
        // parentSuite / suite / subSuite los completa allure-playwright solo:
        // navegador → archivo .spec.ts → test.describe.
        // Alternativa: ['epic', 'feature', 'story'] agrupa por las etiquetas
        // de negocio que ponemos con allure.epic(), allure.feature()... (ver
        // tests/10-e2e-checkout.spec.ts). Los tests sin etiquetas quedarían
        // sueltos, por eso usamos el agrupado por suites.
        groupBy: ['parentSuite', 'suite', 'subSuite'],
      },
    },
    // "dashboard": una página aparte con gráficos de tendencia.
    dashboard: {
      options: {
        reportName: 'Sauce Demo - Dashboard',
        reportLanguage: 'es',
      },
    },
  },
});
