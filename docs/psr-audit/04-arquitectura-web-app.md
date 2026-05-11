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
