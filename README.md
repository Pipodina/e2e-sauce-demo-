# Playwright + TypeScript + POM: guía de aprendizaje

Proyecto de práctica sobre <https://sauce-demo.myshopify.com/>. Cada archivo tiene comentarios que explican qué hace y por qué. Este README es el mapa para leerlos.

## 1. Cómo correrlo

```powershell
cd playwright-sauce-demo
npm install                       # instala dependencias (solo la primera vez)
npx playwright install chromium   # descarga el navegador (solo la primera vez)

npm test                 # corre todos los tests (sin ver el navegador)
npm run test:headed      # igual, pero viendo el navegador
npm run test:ui          # modo UI: elegís tests, ves cada paso, re-ejecutás (EL MEJOR para aprender)
npm run test:debug       # pausa en cada paso con el inspector
npm run test:smoke       # solo los tests con tag @smoke
npm run report           # abre el reporte HTML de la última corrida
npm run allure           # genera el reporte Allure (con gráficos) y lo abre en el navegador
npm run typecheck        # chequea errores de TypeScript sin correr tests

npx playwright test tests/06-cart.spec.ts        # un solo archivo
npx playwright test -g "cambiar la cantidad"     # tests cuyo nombre contenga ese texto
npx playwright codegen https://sauce-demo.myshopify.com   # graba tus clicks y genera código
```

## 2. Estructura de carpetas

```
playwright-sauce-demo/
├── playwright.config.ts        ← configuración global (baseURL, navegador, timeouts, evidencias)
├── tsconfig.json               ← configuración de TypeScript
├── package.json                ← dependencias y scripts (npm test, npm run report...)
│
├── pages/                      ← PAGE OBJECTS: CÓMO interactuar con cada página
│   ├── BasePage.ts             ← clase padre: page, header, heading, goto()
│   ├── components/             ← piezas que se repiten en varias páginas
│   │   ├── HeaderComponent.ts      (buscador, login, carrito, menú)
│   │   └── ProductGridComponent.ts (grilla de productos)
│   ├── HomePage.ts
│   ├── CatalogPage.ts
│   ├── ProductPage.ts
│   ├── CartPage.ts
│   ├── SearchResultsPage.ts
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   └── ContentPages.ts         (About Us + Blog)
│
├── fixtures/
│   └── pages.fixture.ts        ← "pegamento": crea los Page Objects y se los da a los tests
│
├── test-data/                  ← QUÉ datos usar (productos, usuarios)
│   ├── products.ts
│   └── users.ts
│
├── utils/                      ← funciones de ayuda sin dependencia de una página
│   ├── price.ts                    ("£55.00" → 55)
│   └── shopifyApi.ts               (atajos por API: agregar al carrito sin UI)
│
└── tests/                      ← los TESTS: QUÉ se verifica (numerados en orden de lectura)
    ├── 01-home.spec.ts
    ├── 02-navigation.spec.ts
    ├── ...
    └── 10-e2e-checkout.spec.ts
```

**Regla mental:**
- `pages/` sabe **cómo** se hace algo (selectores, clicks).
- `tests/` dice **qué** se quiere comprobar (pasos y `expect`).
- `test-data/` dice **con qué datos**.

## 3. Cómo se relacionan los archivos

```
              playwright.config.ts
   (baseURL, navegador, timeouts; Playwright lo aplica a cada `page`)
                        │
                        ▼
  ┌──────────── fixtures/pages.fixture.ts ─────────────┐
  │  test = base.extend({ homePage, cartPage, ... })   │
  │  crea:  new CartPage(page)                          │
  └───────────────┬────────────────────────────────────┘
                  │ import { test, expect }
                  ▼
          tests/06-cart.spec.ts ──import──► test-data/products.ts
                  │  test('...', async ({ productPage, cartPage }) => {
                  │     await productPage.addToCart();
                  │     expect(await cartPage.getTotal()).toBe(55);
                  ▼
       pages/CartPage.ts ──extends──► pages/BasePage.ts ──tiene──► components/HeaderComponent.ts
              │
              └──import──► utils/price.ts
```

En palabras:
1. Corrés `npm test`. Playwright lee `playwright.config.ts` y busca los archivos `*.spec.ts` en `tests/`.
2. Cada test pide fixtures por nombre: `async ({ cartPage }) => ...`.
3. Playwright busca `cartPage` en `fixtures/pages.fixture.ts`, abre un navegador limpio, crea `new CartPage(page)` y se lo pasa al test.
4. `CartPage` hereda de `BasePage`, así que también trae `header`, `heading` y `goto()`.
5. El test llama métodos del Page Object y verifica con `expect`. Los datos esperados vienen de `test-data/`.

## 4. Orden de lectura sugerido

| # | Archivo | Qué aprendés |
|---|---------|--------------|
| 1 | `playwright.config.ts` | Configuración, baseURL, timeouts, evidencias |
| 2 | `pages/BasePage.ts` | Qué es POM, herencia, clase abstracta |
| 3 | `pages/components/HeaderComponent.ts` | Locators, composición, prioridad de selectores, strict mode |
| 4 | `pages/HomePage.ts` | Cómo hereda una página (`extends`, `super`) |
| 5 | `fixtures/pages.fixture.ts` | Fixtures y cómo se conectan tests y páginas |
| 6 | `tests/01-home.spec.ts` | `test`, `describe`, `beforeEach`, `expect`, tags |
| 7 | `tests/02-navigation.spec.ts` | `toHaveURL`, tests parametrizados |
| 8 | `pages/components/ProductGridComponent.ts` + `tests/03-catalog.spec.ts` | Leer datos de la página, `toEqual`, `expect.soft` |
| 9 | `pages/ProductPage.ts` + `tests/04-product.spec.ts` | URL dinámica, `waitForResponse`, enabled/disabled, 404 |
| 10 | `tests/05-search.spec.ts` | Probar UI y URL, `searchParams` |
| 11 | `pages/CartPage.ts` + `tests/06-cart.spec.ts` | Filas de una tabla, `test.step`, cálculos, AAA |
| 12 | `tests/07-login.spec.ts` / `08-register.spec.ts` | Formularios, `evaluate`, validación HTML5, factories |
| 13 | `utils/shopifyApi.ts` + `tests/09-api.spec.ts` | Tests de API, `test.fail` para bugs conocidos |
| 14 | `tests/10-e2e-checkout.spec.ts` | Flujo completo, preparar estado por API |

## 5. Reporte con Allure

```powershell
npm test          # 1) limpia allure-results (script "pretest") y corre los tests
npm run allure    # 2) genera allure-report/ y lo abre en el navegador
```

Cómo funciona:

```
npm test ──► allure-playwright (playwright.config.ts) ──► allure-results/   (un .json por test + evidencias)
npm run allure ──► allure generate (lee allurerc.mjs) ──► allure-report/    (HTML con gráficos)
                                                     └─► allure-history/   (tendencia entre corridas)
```

| Script | Qué hace |
|---|---|
| `npm run allure` | Genera y abre el reporte. |
| `npm run allure:generate` | Solo genera `allure-report/`. |
| `npm run allure:open` | Abre un reporte ya generado. |
| `npm run allure:clean` | Borra `allure-results/`. Corre solo antes de `npm test`, `test:headed` y `test:smoke`. Si no se limpia, Allure mezcla las corridas viejas con la nueva. |

El reporte tiene dos vistas: `awesome` (la principal, con árbol de tests y gráficos) y `dashboard` (tendencias). Con cada corrida nueva, los gráficos de historial muestran más datos.

En `tests/10-e2e-checkout.spec.ts` hay ejemplos de etiquetas de Allure (`epic`, `feature`, `story`, `severity`, `owner`, `link`). Son opcionales: sin ellas el reporte igual muestra todos los tests, los `test.step()` y los tags `@smoke`.

**Ojo:** si corrés con `npx playwright test` en vez de `npm test`, no se limpia `allure-results/`. Corré `npm run allure:clean` antes.

## 6. Glosario rápido

| Concepto | Qué es |
|----------|--------|
| **Page** | Una pestaña del navegador. |
| **Locator** | Una "receta" para encontrar un elemento. Es perezosa: busca recién al usarse y vuelve a buscar cada vez. |
| **Web-first assertion** | `await expect(locator).toBeVisible()`: reintenta hasta que se cumpla o pase el timeout. Por eso casi no hacen falta esperas manuales. |
| **Strict mode** | Si un locator encuentra más de un elemento y hacés click, Playwright falla. Se resuelve acotando (`header.locator(...)`), con `filter()` o con `.first()`. |
| **Fixture** | Algo que Playwright prepara y entrega al test (`page`, `request`, o los tuyos como `cartPage`). |
| **BrowserContext** | Navegador aislado (como una ventana de incógnito). Cada test tiene el suyo, así que no comparte cookies ni carrito. |
| **POM** | Una clase por página con sus locators y acciones. Los tests no tocan selectores. |
| **Componente** | Parte de UI repetida (header, grilla) modelada como clase y compuesta dentro de las páginas. |
| **Trace** | Grabación paso a paso de un test fallido. Se abre desde el reporte HTML o con `npx playwright show-trace <zip>`. |

## 7. Hallazgos al explorar la web

Los tests reflejan cosas reales de esta web. Están comentadas en el código:

- Hay ids duplicados (`#customer_login_link` aparece dos veces, igual que `id="email"` en el registro). Por eso esos locators están acotados al contenedor o usan el atributo `name`.
- El carrito se dibuja dos veces (un "drawer" oculto y la página), así que todo en `CartPage` se acota a `#cart`.
- El label del email en "Reset Password" no apunta a su input, y por eso `getByLabel` no funciona ahí.
- "You Might Also Like..." solo aparece entrando al producto desde una colección.
- **Bug:** la API `/cart/add.js` deja agregar productos agotados, aunque la UI lo impide. Está documentado con `test.fail()` en `09-api.spec.ts`.
- Login y registro no se envían: tienen hCaptcha y crearían datos reales en una tienda pública.

## 8. Ejercicios para practicar

1. Agregá Firefox en `playwright.config.ts` (`npx playwright install firefox`) y corré la suite en los dos navegadores.
2. Creá `tests/11-footer.spec.ts` y un `FooterComponent` que verifique los links "Search" y "About Us" y los logos de tarjetas.
3. Sumá un método `getItemCount()` a `CartPage` y usalo en un test.
4. Agregá a `ProductPage` un test de "zoom" de la imagen (pista: `hover()`).
5. Rompé un selector a propósito, corré el test y abrí el trace en el reporte para ver cómo se depura.
