# Auditoria, Gobernanza y Reproducibilidad

## 1. Principio de reproducibilidad

Todo ranking publicado debe poder responder:

- que eventos lo generaron,
- que version del modelo se uso,
- que parametros estaban activos,
- cual era el rating previo,
- cual fue el rating posterior,
- que evidencia respaldo cada evento,
- si hubo correcciones o disputas.

## 2. Auditoria de evento

Cada evento procesado debe tener:

```text
sourceType
sourceId
modelVersion
seasonId
payload
resultHash
evidenceUrl
status
occurredAt
```

El `resultHash` permite detectar si el resultado procesado cambio.

## 3. Auditoria de jugador

Para cada jugador, `RankingDelta` conserva:

```text
muBefore
sigmaBefore
psrBefore
muAfter
sigmaAfter
psrAfter
deltaPsr
placement
kills
lobbyStrength
performanceSignal
explanation
```

La explicacion JSON incluye:

- tipo de evento,
- peso de resultado,
- ajuste por performance,
- numero de partida de calibracion,
- verificacion,
- rondas jugadas,
- average placement,
- average kills,
- skill points,
- raw points,
- matchpoint.

## 4. Separacion entre habilidad y confianza

PSR no debe mezclar habilidad competitiva con confianza operativa.

```text
skill_rating = habilidad estimada
trust_score = riesgo operativo / confiabilidad
```

Ejemplo:

- Jugador muy habil con evidencia dudosa: PSR alto, trust bajo.
- Jugador confiable pero nuevo: trust alto, PSR en calibracion.

Esta separacion es necesaria para decisiones justas:

- matchmaking,
- torneos,
- pagos,
- revision manual,
- limites de participacion.

## 5. Gobernanza de versiones

Cada cambio al modelo debe producir:

- nueva version,
- changelog,
- parametros congelados,
- razon del cambio,
- backtest comparativo,
- fecha de activacion,
- plan de rollback.

Ejemplo:

```text
psr-0.1-draft -> psr-0.2-legacy-shadow -> psr-1.0-production
```

## 6. Criterios para activar uso monetario completo

Antes de usar PSR como criterio final de premios, se recomienda demostrar:

- estabilidad del top 10,
- prediccion razonable de resultados futuros,
- bajo impacto de una sola partida extrema,
- ausencia de sesgos evidentes por region/modalidad,
- funcionamiento de disputas,
- logs completos,
- posibilidad de recalculo desde cero.

Estado actual: PSR esta disponible en produccion como ranking visible y
auditable, pero debe considerarse `shadow/monitoreo` para decisiones monetarias
finales. Ya existen torneos con wallet, pagos y premios en codigo; por eso la
recomendacion de gobernanza es que PSR clasifique y explique habilidad, pero que
los pagos dependan de resultados verificados y reglas de torneo congeladas.

## 7. Reglas de intervencion admin

Un admin puede corregir un resultado, pero el sistema debe:

1. guardar el nuevo resultado,
2. eliminar/regenerar registros derivados de ese evento,
3. reconstruir PSR,
4. dejar nuevo `RankingEventLog`,
5. reflejar nuevos `RankingDelta`.

Nunca se debe editar manualmente `psrScore` como fuente primaria.

## 8. Gobernanza de pagos y premios

Los flujos monetarios deben responder preguntas distintas al ranking:

- quien pago,
- cuanto pago,
- con que proveedor,
- que referencia externa respalda la transaccion,
- si hubo duplicado/reintento/webhook,
- si la inscripcion fue creada,
- si el torneo fue cancelado,
- si el premio fue distribuido,
- si existe una disputa abierta.

Tablas y campos principales:

```text
Wallet.balance
Wallet.heldBalance
Transaction.type
Transaction.amount
Transaction.status
Transaction.reference
Tournament.entryFee
Tournament.prizePool
Tournament.prizeDistribution
TournamentEntry.paidAmount
TournamentResult.adminVerified
```

Reglas vigentes:

- PayPal y MercadoPago usan referencias externas para idempotencia de depositos.
- Los flujos `paypal-join` y `mercadopago-join` acreditan deposito primero y
  luego intentan crear la inscripcion.
- Si la inscripcion falla despues de acreditar deposito, el dinero queda como
  saldo de wallet.
- La cancelacion admin reembolsa entradas y pone `prizePool = 0`.
- Salir de un torneo en registro devuelve `paidAmount` o `entryFee`.
- La distribucion de premios usa presets y retiene `PLATFORM_COMMISSION = 0.1`.
- Los retiros descuentan comision configurable (`WITHDRAWAL_COMMISSION`, default
  `0.05`) y quedan con estado `processing`.

## 9. Hallazgos de auditoria operativa vigentes

### Fortalezas

- El ranking no se calcula en el frontend.
- El PSR deja `RankingEventLog`, `RankingDelta` y `RankingSnapshot`.
- La captura de torneo guarda `sourceHash`, `captureMeta` y flags de
  verificacion.
- Los endpoints de PayPal/MercadoPago verifican pagos en servidor.
- Los webhooks validan firma antes de acreditar wallet.
- Los flujos "fund + join" son idempotentes para depositos y evitan que el
  usuario pierda dinero si falla la inscripcion.

### Riesgos abiertos antes de dinero real

- `POST /api/tournaments/[id]/join` debe envolverse en una transaccion atomica
  igual que los flujos `paypal-join` y `mercadopago-join`.
- `POST /api/wallet` conserva un deposito manual de desarrollo; debe
  deshabilitarse o limitarse antes de produccion monetizada real.
- Las credenciales compartidas por chat deben rotarse antes de activar modo
  `live`.
- Falta conciliacion periodica contra reportes de PayPal/MercadoPago.
- Falta un ledger append-only o restriccion unica formal para
  `Transaction.reference + type`.
- Falta estado explicito para disputas de pago, chargebacks y retiros aprobados.

## 10. Requisitos para PSR v1.0 monetizado

Antes de declarar `psr-1.0-production`, se recomienda exigir:

1. Backtest documentado con datos `00_old`.
2. Comparacion contra modelo simple de puntos legacy.
3. Reporte de sensibilidad por modalidad y fuente.
4. Revision manual de top movers y outliers.
5. Politica publica de disputas.
6. Congelamiento de parametros y changelog.
7. Prueba de reconstruccion desde cero.
8. Revision de seguridad de pagos, webhooks, reembolsos y retiros.
9. Prueba de conciliacion financiera end-to-end.
10. Separacion de roles admin para resultados, pagos y modelo.
