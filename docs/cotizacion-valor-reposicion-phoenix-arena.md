# Cotización técnica y valor de reposición

**Proyecto:** Phoenix Arena  
**Fecha de corte:** 11 de mayo de 2026  
**Objetivo del documento:** sustentar, para cotización y pitch técnico, qué se ha construido, qué tipo de producto es, cuánto costaría reponerlo desde cero y cuánto falta presupuestar para operar con dinero real de forma robusta.

## 1. Resumen ejecutivo

Phoenix Arena no es una página web informativa. Es una **webapp transaccional competitiva para esports/gaming**, orientada a torneos, retos, perfiles de jugador, ranking verificable, wallet interna, pagos, premios, panel administrativo y auditoría de resultados.

El componente diferencial es **Phoenix Skill Rating (PSR)**: un algoritmo de clasificación de habilidad basado en evidencia, con sustento metodológico y trazabilidad. PSR no funciona como una suma simple de puntos; estima habilidad e incertidumbre con una lógica bayesiana conservadora inspirada en modelos de rating competitivos como TrueSkill, Glicko/Glicko-2 y OpenSkill.

Con base en el alcance observado en el repositorio, el valor de reposición defendible del estado actual es:

| Escenario | Rango estimado |
|---|---:|
| Reposición profesional nearshore/senior del estado actual | **USD $115,000 - $170,000** |
| Equivalente aproximado en MXN, usando 1 USD ~= 17.21 MXN | **MXN $1.98M - $2.93M** |
| Presupuesto adicional recomendado antes de dinero real | **USD $35,000 - $60,000** |
| Producto endurecido para operación monetizada | **USD $150,000 - $230,000** |

Estos montos no son una tasación legal ni contable. Son una estimación de reposición técnica: cuánto costaría contratar a un equipo profesional para reconstruir un producto equivalente, con el mismo tipo de arquitectura, lógica de negocio, algoritmo, datos históricos, pagos, panel administrativo, documentación y despliegue.

## 2. Tipo de producto construido

Phoenix Arena debe clasificarse como una **plataforma web full-stack transaccional con componente fintech-lite y algoritmo competitivo propio**.

En términos de producto, combina:

- **SaaS vertical para comunidad competitiva:** perfiles, comunidad, ranking, ladder, tienda, bóveda, feed y operación recurrente.
- **Plataforma de torneos:** creación de torneos, inscripción, resultados, premios, formatos, splits y cancelaciones.
- **Wallet interna:** saldo, depósitos, retiros, comisiones, historial de transacciones y reembolsos.
- **Pasarela de pagos:** PayPal implementado en sandbox y MercadoPago implementado en código para México/MXN, con endpoints y webhooks.
- **Motor de rating/ranking propietario:** PSR, con cálculo auditable, snapshots persistidos, deltas por jugador e historial.
- **Panel admin operativo:** usuarios, torneos, resultados, transacciones, disputas, actividad y tienda.
- **Capa documental/legal:** términos, privacidad, pagos, habilidad/ranking, ayuda y expediente técnico PSR.

La complejidad principal no viene de “hacer pantallas”, sino de coordinar resultado competitivo, dinero, evidencia, auditoría, ranking, reversibilidad y confianza operativa.

## 3. Alcance técnico observado en el proyecto

### Stack

- **Frontend/backend:** Next.js 16 App Router, React 19, TypeScript.
- **Base de datos y ORM:** Prisma 7 con esquema SQLite/libSQL.
- **Deploy:** Vercel, conectado a `main`.
- **Pagos:** PayPal REST API v2; MercadoPago REST API/Checkout.
- **Datos históricos:** importación desde archivos Excel `00_old`.
- **Documentación:** expediente PSR, auditoría de datos antiguos, presentaciones y PDFs.

### Métricas del repositorio

| Evidencia local | Valor observado |
|---|---:|
| Archivos versionados | 177 |
| Commits visibles en `main` | 46 |
| Ventana de trabajo visible en Git | 27 mar 2026 - 10 may 2026 |
| Código/documentación técnica en `src`, `prisma`, `scripts`, `docs` | ~25,350 líneas |
| Archivos históricos importados desde `00_old` | 156 |
| Participaciones históricas normalizadas | 8,337 |
| Jugadores únicos normalizados | 2,843 |
| Eventos PSR persistidos en producción | 155 |
| Deltas auditables de ranking | 8,272 |
| Jugadores en ranking productivo observado | 2,846 |

## 4. Qué se ha construido

### Producto visible para usuarios

- Home pública con propuesta de valor para jugadores LATAM.
- Registro, login, sesión persistente y login Discord.
- Perfiles de jugador con PSR, historial y posts.
- Comunidad y perfiles públicos.
- Ranking PSR con filtros, tiers, percentiles, calibración y estado de decaimiento.
- Torneos con inscripción y pagos.
- Retos/QuickMatch.
- Wallet con depósitos, retiros e historial.
- Tienda, bóveda, ladder, pulso/feed y páginas de ayuda/legal.

### Operación/admin

- Panel admin con módulos para usuarios, torneos, resultados, matches, transacciones, disputas, actividad y tienda.
- Captura avanzada de resultados de torneo.
- Cancelación de torneos con reembolsos.
- Cierre de resultados con reconstrucción PSR.
- Distribución de premios por presets o splits personalizados.
- Auditoría de actividad y transacciones.

### Pagos y dinero

El proyecto ya contiene una arquitectura de dinero interna:

- `Wallet.balance` y `Wallet.heldBalance`.
- `Transaction` con tipos: `deposit`, `tournament_entry`, `tournament_refund`, `tournament_win`, `withdrawal`, `commission`.
- PayPal:
  - creación de orden;
  - aprobación/captura server-side;
  - webhook con verificación de firma;
  - idempotencia por referencia;
  - flujo “fund + join” para pagar e inscribirse a torneo.
- MercadoPago:
  - creación de preferencia;
  - conversión USD -> MXN;
  - `external_reference` con usuario, monto y torneo;
  - verificación server-side;
  - webhook HMAC;
  - flujo “fund + join”.
- Premios:
  - comisión de plataforma del 10% sobre prize pool distribuible;
  - `winner_takes_all`, `top_3`, `top_5`, `top_8` y `custom`;
  - premios como transacciones auditables.

Estado operativo actual: PayPal está documentado como `sandbox`; MercadoPago existe en código, pero la opción principal está oculta en UI. Antes de mover dinero real, se recomienda una fase formal de hardening.

## 5. Tipo de algoritmo: Phoenix Skill Rating (PSR)

PSR es un **algoritmo de rating competitivo bayesiano, conservador, auditable y basado en evidencia**.

La idea central es que cada jugador tiene una habilidad latente:

```text
habilidad_i ~ Normal(mu_i, sigma_i^2)
PSR_i = mu_i - 3 * sigma_i
```

Donde:

- `mu` representa la estimación central de habilidad.
- `sigma` representa incertidumbre.
- `PSR = mu - 3*sigma` publica un valor conservador, para no inflar jugadores con poca evidencia.

El modelo utiliza señales de:

- placement final;
- placement promedio por mapas;
- kills normalizadas;
- puntos de equipo;
- fuerza del lobby;
- número de eventos rankeables;
- verificación administrativa;
- inactividad/decaimiento;
- Matchpoint y casos históricos separados para auditoría.

La decisión metodológica importante es que PSR **no mezcla habilidad con confianza operativa ni con saldo financiero**. Habilidad, trust score y dinero son subsistemas separados. Esto permite resolver disputas deportivas o financieras sin reescribir silenciosamente el historial.

### Sustento metodológico

PSR se apoya conceptualmente en:

- **TrueSkill**, de Microsoft Research, que modela habilidad con `mu` y `sigma` y usa una estimación conservadora `mean - 3 * uncertainty`.
- **Glicko/Glicko-2**, que mejora Elo incorporando incertidumbre/fiabilidad del rating.
- **OpenSkill**, que ofrece rating para escenarios multiplayer y multi-equipo.

Por eso el valor técnico del proyecto no está solo en el código, sino en haber adaptado esa familia metodológica al dominio real de Phoenix Arena: Warzone, torneos multijugador, datos históricos, evidencia administrativa, pagos y ranking público.

## 6. Valor de reposición del estado actual

La siguiente estimación usa una tarifa blended de **USD $65/hora**. Esta tarifa está por encima del rango promedio de México publicado por Clutch porque el proyecto requiere seniority en backend, pagos, auditoría, datos, ranking algorítmico y operación con dinero. Aun así, queda por debajo de una agencia de Estados Unidos, donde Clutch lista rangos de USD $100-$149/h.

| Módulo | Horas estimadas | Costo a USD $65/h |
|---|---:|---:|
| Descubrimiento, arquitectura y diseño de sistema | 90 - 130 | $5,850 - $8,450 |
| UX/UI, experiencia responsive y contenido de producto | 110 - 160 | $7,150 - $10,400 |
| Frontend de la app pública y usuario | 180 - 270 | $11,700 - $17,550 |
| Backend, APIs y modelo de datos Prisma | 180 - 280 | $11,700 - $18,200 |
| Autenticación, roles, perfiles, comunidad, tienda/vault | 110 - 170 | $7,150 - $11,050 |
| Torneos, retos, resultados, disputas y admin operativo | 210 - 310 | $13,650 - $20,150 |
| Wallet, PayPal, MercadoPago, premios y reembolsos | 170 - 260 | $11,050 - $16,900 |
| PSR: algoritmo, ranking, snapshots, historial y auditoría | 260 - 380 | $16,900 - $24,700 |
| Importación histórica, normalización y documentación de datos | 120 - 180 | $7,800 - $11,700 |
| DevOps, performance, QA, despliegue y documentación final | 120 - 160 | $7,800 - $10,400 |
| **Subtotal técnico** | **1,550 - 2,300 h** | **$100,750 - $149,500** |
| Dirección técnica/PM/contingencia razonable (~12%) | **186 - 276 h** | **$12,090 - $17,940** |
| **Valor de reposición recomendado** | **1,736 - 2,576 h** | **$112,840 - $167,440** |

**Rango redondeado para pitch:** **USD $115,000 - $170,000**  
**Equivalente MXN aproximado:** **MXN $1.98M - $2.93M**, usando ~17.21 MXN/USD.

## 7. Costo adicional para operar dinero real

El proyecto ya tiene una base fuerte, pero una plataforma con pagos, premios y retiros necesita una fase de endurecimiento antes de pasar a `live`.

| Paquete restante | Horas estimadas | Costo a USD $65/h |
|---|---:|---:|
| Ledger/idempotencia fuerte y atomicidad de inscripción wallet-only | 70 - 110 | $4,550 - $7,150 |
| Conciliación PayPal/MercadoPago, duplicados, chargebacks y reportes | 80 - 130 | $5,200 - $8,450 |
| Flujo formal de retiros y aprobación admin | 60 - 100 | $3,900 - $6,500 |
| Seguridad live: secretos, roles, revisión de webhooks y hardening | 70 - 120 | $4,550 - $7,800 |
| QA/E2E de flujos financieros, torneos y premios | 90 - 160 | $5,850 - $10,400 |
| Backtest PSR, calibración, outliers y model card pública | 80 - 140 | $5,200 - $9,100 |
| Políticas operativas, soporte, disputas y documentación legal-base | 30 - 60 | $1,950 - $3,900 |
| **Subtotal restante** | **480 - 820 h** | **$31,200 - $53,300** |
| Dirección técnica/PM/contingencia (~12%) | **58 - 98 h** | **$3,744 - $6,396** |
| **Presupuesto adicional recomendado** | **538 - 918 h** | **$34,944 - $59,696** |

**Rango redondeado:** **USD $35,000 - $60,000**  
**Equivalente MXN aproximado:** **MXN $602,000 - $1.03M**.

## 8. Tiempo necesario

El historial visible en Git muestra una ventana de trabajo del **27 de marzo de 2026 al 10 de mayo de 2026**, con 46 commits. Eso representa aproximadamente 6.5 semanas calendario de avance intenso, probablemente con mucha aceleración por herramientas modernas/IA y decisiones rápidas.

Para reconstruir profesionalmente el estado actual desde cero:

| Equipo | Tiempo estimado |
|---|---:|
| 1 dev senior full-stack + soporte puntual | 6 - 9 meses |
| 2 devs full-stack + 1 product/design parcial | 14 - 22 semanas |
| Equipo agencia completo, con QA y PM | 4 - 6 meses |

Para llevarlo de estado actual a monetización live:

| Fase | Tiempo estimado |
|---|---:|
| Hardening financiero y seguridad | 3 - 5 semanas |
| QA/E2E, conciliación y retiros | 3 - 5 semanas |
| Validación PSR y documentación pública | 2 - 4 semanas |
| **Total adicional recomendado** | **6 - 10 semanas**, en paralelo parcial |

## 9. Costos variables de operación

Además del desarrollo, la plataforma tiene costos variables:

| Concepto | Rango/nota |
|---|---|
| Vercel | Pro desde USD $20/mes + uso adicional. |
| Base de datos/libSQL/Turso o equivalente | Puede iniciar bajo, pero debe presupuestarse según tráfico, backups y almacenamiento. |
| PayPal México | Tarifa comercial doméstica estándar observada: 3.95% + cuota fija, sujeta a IVA. |
| MercadoPago México | Checkout: tarifas publicadas alrededor de 3.49% + IVA para disponibilidad inmediata; varían según plazo y medio de pago. |
| Dominio, correo, monitoreo, logs, storage | Estimación inicial: USD $30 - $300/mes, según stack final. |
| Soporte/operación/conciliación | 20 - 60 h/mes después de live, según volumen y disputas. |

Los fees de proveedores no son margen de plataforma; deben modelarse dentro de la economía de cada torneo, junto con IVA/impuestos, chargebacks, comisiones de retiro, soporte y reserva de riesgo.

## 10. Riesgos abiertos antes de cotizar dinero real

El proyecto ya documenta varios riesgos importantes:

- Desactivar o restringir el depósito manual de desarrollo en `/api/wallet`.
- Hacer atómico el join wallet-only.
- Crear restricción única o ledger append-only para `Transaction(type, reference)`.
- Implementar conciliación diaria contra PayPal/MercadoPago.
- Formalizar retiros con `WithdrawalRequest`, revisión y referencia externa.
- Rotar credenciales antes de pasar de sandbox/live.
- Separar permisos admin para resultados, dinero y modelo.
- Ejecutar backtests de PSR antes de que el rating determine premios o acceso monetizado.
- Publicar reglas de disputa, corrección de resultados y ajustes financieros.

## 11. Mensaje de pitch técnico

Phoenix Arena ya tiene construido el esqueleto de una plataforma competitiva monetizable: no solo muestra jugadores, sino que convierte evidencia de torneos en ranking, ranking en reputación competitiva y torneos en flujos transaccionales auditables.

El activo central es la combinación de tres capas:

1. **Producto/comunidad:** jugadores, perfiles, torneos, ranking, tienda, wallet y operación admin.
2. **Algoritmo defendible:** PSR como rating bayesiano conservador, con incertidumbre, evidencia, historial y auditoría.
3. **Infraestructura monetizable:** pagos, wallet, prize pool, premios, reembolsos y trazabilidad.

La tesis para inversionistas o socios no debe ser “hicimos una web”, sino:

> Construimos una infraestructura competitiva para esports LATAM donde la habilidad verificable puede ordenar torneos, reputación y premios sin depender de una tabla manual opaca.

## 12. Fuentes externas usadas

- Clutch, *Software Development Company Pricing Guide 2026*: rangos por proyecto, promedio de costo, timeline y tarifas por país. https://clutch.co/developers/pricing
- PayPal México, *Merchant Fees*, actualización 9 feb 2026. https://www.paypal.com/mx/business/paypal-business-fees?locale.x=en_MX
- PayPal Developer, *Orders v2 API integration*. https://developer.paypal.com/api/rest/integration/orders-api/
- MercadoPago México, *Checkout para sitio web*. https://www.mercadopago.com.mx/herramientas-para-vender/check-out
- MercadoPago Developers, *Primeros pasos*. https://www.mercadopago.com.mx/developers/es/docs/getting-started
- Microsoft Research, *TrueSkill Ranking System*. https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/
- Mark Glickman, *The Glicko System*. https://www.glicko.net/glicko/glicko.pdf
- OpenSkill, *Multiplayer Rating System*. https://openskill.me/
- Tipo de cambio de referencia consultado: dólar México, 8 may 2026, ~17.21 MXN/USD. https://eldolar.mx/dolar-2026-05-08

## 13. Supuestos y exclusiones

Esta cotización asume que el objetivo es reponer el estado funcional y documental observado en el repositorio. No incluye:

- asesoría legal especializada en apuestas, juegos de habilidad, sorteos, fintech, KYC/AML o regulación local;
- certificación de seguridad externa;
- auditoría contable;
- campañas de marketing;
- soporte 24/7;
- costos fiscales, IVA o impuestos por operación;
- reservas para contracargos;
- fee de procesadores de pago;
- diseño de marca completo fuera de lo ya implementado.

Si Phoenix Arena se presenta ante socios, patrocinadores o inversionistas, la cifra más defendible es comunicar un **activo tecnológico construido con valor de reposición de USD $115k-$170k**, y un **roadmap de live monetizado de USD $35k-$60k adicionales**.
