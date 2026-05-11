# Arquitectura Web y Trazabilidad

## 1. Flujo de alto nivel

```text
captura de resultado
  -> RankingMatchRecord
  -> rebuildAndPersistPsrRankings()
  -> RankingEventLog
  -> RankingDelta
  -> RankingSnapshot
  -> API / ranking / perfil / admin
```

La web app no calcula ranking solamente en el frontend. El frontend visualiza
datos persistidos o calculados por servicios del backend.

## 2. Componentes principales

### Motor matematico

Archivo:

```text
src/lib/scoring/psr.ts
```

Responsabilidades:

- definir parametros,
- calcular PSR,
- aplicar eventos,
- actualizar `mu` y `sigma`,
- generar deltas explicables,
- calcular leaderboard.

### Servicio de ranking

Archivo:

```text
src/lib/ranking/psr-service.ts
```

Responsabilidades:

- leer usuarios y registros,
- agrupar eventos por `sourceType/sourceId`,
- convertir registros a eventos PSR,
- reconstruir ranking desde cero,
- persistir logs, deltas y snapshots.

### Historial por jugador

Archivo:

```text
src/lib/ranking/player-history.ts
```

Responsabilidades:

- leer `RankingDelta`,
- unirlo con `RankingEventLog`,
- reconstruir series historicas,
- preparar histogramas,
- exponer resumen de 30 dias.

### Visualizacion

Archivo:

```text
src/components/player-psr-history.tsx
```

Responsabilidades:

- graficar PSR, mu, sigma, performance y lobby strength,
- mostrar histogramas de placement, kills, delta y performance,
- listar eventos que explican el rating.

## 3. APIs relevantes

### Ranking global

```text
GET /api/ranking
POST /api/ranking
```

`GET` calcula snapshot actual sin mutar tablas de auditoria.
`POST` es admin-only y reconstruye/persiste.

### Perfil publico

```text
GET /api/community/[id]
```

Devuelve perfil publico e historial PSR.

### Perfil propio

```text
GET /api/profile
```

Devuelve datos privados del usuario autenticado e historial PSR.

### Admin usuarios

```text
GET /api/admin/users
GET /api/admin/users/[id]
```

Permite revisar usuarios y su historial competitivo desde la seccion admin.

### Captura de torneos

```text
POST /api/admin/tournaments/[id]/results
PUT /api/admin/tournaments/[id]/results
```

Normaliza datos de torneo, crea registros rankeables y reconstruye PSR.

## 4. Tablas de auditoria

### RankingMatchRecord

Registro normalizado de entrada al modelo.

### RankingEventLog

Evento procesado, con payload y hash. Permite reconstruir que se proceso.

### RankingDelta

Cambio por jugador:

- `muBefore`
- `sigmaBefore`
- `psrBefore`
- `muAfter`
- `sigmaAfter`
- `psrAfter`
- `deltaPsr`
- explicacion JSON

### RankingSnapshot

Foto del ranking en un momento.

### RankingModelVersion

Version y parametros del modelo.

## 5. Por que esta arquitectura es defendible

Porque separa:

- captura operativa,
- normalizacion,
- calculo,
- persistencia,
- visualizacion,
- auditoria.

Esto evita que una pantalla o un admin modifique directamente el ranking sin
dejar rastro.

## 6. Arquitectura productiva actual

Estado verificado el `2026-05-11`:

```text
Repositorio GitHub = DruxMeaney/phoenix-arena
Rama productiva Vercel = main
Dominio publico = https://phoenix-arena.vercel.app
Deploy productivo = READY
Commit productivo = 5983d1a
```

Vercel despliega automaticamente cuando `main` recibe cambios. Las ramas
secundarias pueden generar previews, pero no reemplazan produccion hasta que se
mergean a `main` y el build pasa.

La app usa Next.js App Router y Prisma con cliente generado en `postinstall`.
Esto es importante porque el cliente Prisma esta ignorado en Git; Vercel lo
regenera durante la instalacion para evitar builds rotos por artefactos locales.

## 7. Rendimiento del ranking

La primera version calculaba todo el PSR en runtime. La arquitectura vigente
usa snapshots persistidos:

```text
POST /api/ranking o captura admin
  -> rebuild completo
  -> RankingEventLog + RankingDelta + RankingSnapshot
  -> User.psr*

GET /api/ranking
  -> lee ultimo RankingSnapshot
  -> responde tabla publica y stats
```

La pagina `/ranking` recibe los primeros `250` jugadores desde el servidor y
despues hidrata el listado completo desde `GET /api/ranking`. Esto reduce el
riesgo de timeout, mantiene el SSR ligero y conserva una unica fuente auditada.

## 8. APIs monetarias relacionadas

El sistema de pagos no calcula PSR, pero afecta el contexto de torneos y por eso
debe documentarse junto a la auditoria:

```text
POST /api/paypal/create-order
POST /api/paypal/capture-order
POST /api/paypal/webhook
POST /api/mercadopago/create-preference
POST /api/mercadopago/capture-payment
POST /api/mercadopago/webhook
POST /api/tournaments/[id]/join
POST /api/tournaments/[id]/paypal-join
POST /api/tournaments/[id]/mercadopago-join
POST /api/tournaments/[id]/leave
POST /api/admin/tournaments/[id]/cancel
POST /api/wallet
```

PayPal esta configurado en produccion con modo `sandbox`. MercadoPago existe en
codigo y mantiene endpoints/verificacion, aunque la UI actual oculta esa opcion
principal. Antes de activar dinero real se debe pasar por una revision separada
de seguridad, idempotencia, conciliacion y cumplimiento.

## 9. Flujo integrado torneo + dinero + PSR

```text
usuario deposita o usa wallet
  -> Transaction(deposit)
  -> inscripcion a torneo
  -> Transaction(tournament_entry)
  -> TournamentEntry + prizePool
  -> captura admin de resultados
  -> TournamentResult
  -> RankingMatchRecord
  -> PSR rebuild
  -> RankingDelta + RankingSnapshot
  -> premios/reembolsos segun estado del torneo
```

PSR y dinero comparten el torneo como contexto, pero no se mezclan como fuente
de verdad. El rating se deriva de resultados competitivos; el saldo se deriva
de transacciones. Esta separacion es esencial para resolver disputas sin crear
efectos colaterales ocultos.
