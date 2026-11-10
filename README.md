# ñapa · Finanzas claras

**Aplicación pública:** https://rodriguezac.github.io/napa/

El profesor puede abrirla sin cuenta de ChatGPT ni de GitHub.

Aplicativo de análisis financiero para el caso académico **Industrias Plásticas Altamira, S.A.**, Administración Financiera 8402, Universidad Tecnológica de Panamá.

Equipo: Angélica Rodríguez, Eliel García y Anllelina Varcasia.

## Ejecutar

Requiere Node.js 22.13 o posterior (recomendado Node 24 LTS) y npm.

```sh
npm ci
npm run dev
```

Abre la dirección Local que imprime el servidor (normalmente `http://localhost:5173`). No se necesitan cuentas, claves ni base de datos para el análisis financiero local. La versión pública principal se publica en GitHub Pages sin inicio de sesión.

```sh
npm test
npm run check
npm run build
```

## Funcionalidad

- Menú principal, diseño adaptable, tarjetas explicativas y navegación para principiantes.
- Captura de 50 cuentas en 2025 y valores comparables en 2024, filtros y búsqueda.
- Datos complementarios editables: ISR, acciones, año comercial y ventas por producto.
- Estado de resultados, balance con cierre de retenidas y flujo indirecto 2025/2024.
- Balance y efectivo conciliados; diferencias visibles ante cambios incompatibles.
- 13 razones, referencias industriales, semáforo y Du Pont.
- Análisis horizontal y vertical por partida y por cuenta, con gráficos.
- Pro-forma I a plena capacidad y con capacidad ociosa; RNF y balance conciliado.
- Sensibilidad: siete supuestos, escenarios originales y personalizado, gráficos de tornado de utilidad y RNF, comparación y cálculo de una variable a la vez.
- Guardado en localStorage, respaldo/importación JSON, exportación por módulo a Excel y CSV, e impresión de vista.
- Manual e informe del caso original disponibles en `public/docs/`, sin identificadores personales.

## Motor financiero

`lib/finance.mjs` es puro e independiente de la interfaz. Los importes del caso son **datos de entrada**; subtotales, estados, razones y proyecciones se calculan. `tests/finance.test.mjs` verifica contra los valores publicados de 2024, la balanza de 2025, cierres, flujos, Du Pont, ecuación 4-1 y sensibilidad.

La balanza 2025 tiene Debe = Haber = $20,116,250. La utilidad calculada es $208,500 y el activo total $7,793,750. El flujo reconcilia con Caja y bancos en $337,750.

### Criterios transparentes

1. ISR = máximo entre cero y utilidad antes de impuestos × tasa; no se reconoce crédito por pérdidas. El ISR capturado se mantiene como control, no se suma nuevamente al gasto.
2. Todas las rotaciones usan ventas netas y saldos de cierre. Cuentas por cobrar se presentan netas. La razón rápida resta inventarios del activo corriente. La cobertura de cargos fijos agrega arrendamientos tanto a UAII como a intereses.
3. El flujo agrupa préstamo bancario de largo plazo y porción corriente; así las reclasificaciones no duplican flujos. Dividendos pagados = declarados + saldo por pagar inicial − saldo final. Valores negociables y otras inversiones van a inversión. Caja es el único efectivo.
4. Flujo libre sigue la definición del PDF: operación − compras de activos fijos − dividendos pagados.
5. Pro-forma I usa porcentajes históricos **exactos** y partidas fijas del PDF. RNF = aumento de activos espontáneos − aumento de pasivos espontáneos − utilidad retenida del año. Corresponde a la ecuación 4-1 y se aplica a documentos por pagar. No existe un ajuste escondido para cuadrar balances.
6. Sensibilidad usa la tabla de la página 8: sus porcentajes Base redondeados no son iguales a los cocientes históricos. Cobros = ventas × días / año; inventario = ventas / rotación. Para incorporar dichos cambios, A/S de la ecuación 4-1 es el coeficiente efectivo de inversión incremental. Con crecimiento cero, se calcula directamente el aumento de activos; no se divide entre cero. Un RNF negativo amortiza documentos; si estos se vuelven negativos, se advierte que debe definirse otra aplicación del excedente.
7. Semáforo: verde alcanza referencia; ámbar hasta 10% desfavorable; rojo más de 10%. Para cobro y deuda es favorable un menor valor. No son calificaciones crediticias.
8. Los datos quedan en cada navegador; no hay base compartida ni sincronización multiusuario. Se comparten mediante JSON. Los supuestos de sesión se restauran al recargar; las cuentas y complementarios persisten.

## Alcance académico

Fuente: PDF “Parcial N° 3 – Caso Industrias Plásticas Altamira v1”, pp. 2–8, y asignación en Teams. El PDF se menciona como fuente sin redistribuirlo.

El PDF enumera ocho módulos pese a referirse a siete. Menciona Pro-forma II sin presupuestos ni entregable detallado; se implementa la Pro-forma I solicitada. La segunda fecha de sustentación del PDF es incongruente y debe confirmarse con el docente. Entrega indicada en Teams: 30 de noviembre de 2026 antes de las 18:00, por todos los integrantes.

Los documentos públicos describen el caso original y no cambian al editar cuentas. Los archivos Excel y CSV reflejan los datos y supuestos actuales. Las versiones académicas con cédulas se entregan por separado y no se incluyen en este repositorio público.

## Arquitectura

React 19 + TypeScript, Vinext/Vite y Cloudflare Workers. El Worker sirve el aplicativo; los cálculos se ejecutan localmente en el navegador. Los iconos provienen de Lucide. Los estilos y gráficos SVG son propios. No se transmiten entradas contables a servicios externos.


## Publicación gratuita y pública

La aplicación también tiene una compilación estática de React. Usa el mismo motor financiero y las mismas pantallas de la versión Vinext, sin depender de autenticación ni de servicios del servidor.

```sh
npm run build:static
npm run preview:static
```

La carpeta generada es `dist-static/`. El workflow `.github/workflows/pages.yml` compila, prueba y publica automáticamente cada cambio a `main` en GitHub Pages. La ruta base es `/napa/`; para otro alojamiento puede cambiarse mediante la variable `NAPA_BASE_PATH` (por ejemplo `/` en Netlify). Los documentos de descarga usan la ruta base del alojamiento.

Solo las versiones de los PDF sin cédulas se alojan públicamente. Los documentos académicos identificados se conservan por separado en la entrega local.


## Exportaciones por módulo

El botón principal descarga un archivo Excel real (`.xlsx`), con el nombre de la empresa, el reporte, período, moneda, formato contable, secciones, subtotales y gráficas nativas. El botón CSV descarga los datos del mismo módulo, sin prometer formato ni gráficas.

- Panorama: libro integral de 18 hojas, incluidos todos los análisis y sus gráficas.
- Resultados, Balance y Flujo: el estado comparativo correspondiente.
- Razones: las 13 razones, referencias industriales y Du Pont.
- Comparativo: la vista seleccionada (Resultados, Balance o Cuentas).
- Proyección: resultados pro-forma, balance pro-forma y RNF a ambas capacidades, con los supuestos vigentes.
- Escenarios: los tres escenarios originales, el escenario personalizado actual, sus supuestos y la sensibilidad de una variable a la vez.
- Datos: cuentas del año seleccionado y datos complementarios.

Las exportaciones son reportes de los resultados calculados al descargar. Los escenarios no constituyen un segundo simulador en Excel: para variar supuestos se utiliza ñapa y se vuelve a exportar. Los subtotales y las comparaciones del reporte conservan fórmulas de Excel. Las plantillas se crearon con Artifact Tool; el aplicativo actualiza celdas, resultados almacenados y cachés de las gráficas preservando sus estilos y vínculos.

El acceso superior “Ayuda” organiza cuatro secciones: Cómo usar ñapa, Documentos, Criterios de cálculo y Equipo. La información del parcial se encuentra dentro de Equipo y no se mezcla con la navegación financiera.
