# Base de Parametros y Captura de Datos

## 1. Parametros del modelo

Parametros activos en `psr-0.1-draft`:

```text
initialMu = 25
initialSigma = 25 / 3
beta = 25 / 6
tau = 25 / 300
conservativeSigmaMultiplier = 3
minSigma = 1.2
maxSigma = 25 / 3
minMu = 0
maxMu = 60
minRankedMatches = 4
comparisonWeight = 0.85
sigmaShrinkFloor = 0.55
placementWeight = 0.70
killsWeight = 0.20
teamWeight = 0.10
maxMuAdjustment = 0.45
```

Estos parametros no deben verse como "verdades finales". Son una primera
parametrizacion metodologicamente razonable, inspirada en sistemas publicados,
que debe calibrarse empiricamente.

## 2. Tipos de parametros

### Parametros bayesianos

Controlan habilidad e incertidumbre:

- `mu`
- `sigma`
- `beta`
- `tau`
- `minSigma`
- `maxSigma`

### Parametros de publicacion

Controlan como se muestra el ranking:

- `conservativeSigmaMultiplier`
- `minRankedMatches`
- percentiles por tier

### Parametros de performance

Controlan cuanto pesan senales secundarias:

- placement,
- average placement,
- kills por ronda,
- skill points,
- performance adjustment.

### Parametros operativos

Controlan auditoria y calidad de evidencia:

- `sourceType`
- `sourceId`
- `verified`
- `evidenceUrl`
- `modelVersion`
- `captureSchemaVersion`

## 3. Datos minimos por evento

Un evento rankeable debe tener:

```text
sourceType
sourceId
seasonId
tournamentType
occurredAt
verified
entries[]
```

Cada jugador debe tener:

```text
playerId
placement
totalTeams
kills
deaths
teamKills
teamPoints / skillPoints
bestKillsInTournament
bestTeamPointsInTournament
```

## 4. Datos enriquecidos por `00_old`

La auditoria de archivos historicos mostro parametros operativos utiles:

- equipo,
- numero de equipo,
- grupo,
- roster slot,
- capitan,
- handle original,
- handle normalizado,
- rondas jugadas,
- placement promedio,
- kills promedio,
- kills de equipo,
- puntos por formula legacy,
- Matchpoint,
- verificaciones administrativas.

Estos datos ahora se guardan en:

- `TournamentResult`
- `RankingMatchRecord`

## 5. Captura de torneo

La captura admin debe registrar:

```text
teamName
teamNumber
teamGroup
kills
deaths
placement
roundsPlayed
averagePlacement
averageKills
teamKills
skillPoints
rawPoints
matchpointWin
paymentVerified
discordVerified
photoVerified
flyerVerified
rulesAccepted
adminVerified
evidenceUrl
```

## 6. Reglas de normalizacion

1. Si hay `roundResults`, se calculan subtotales por mapa.
2. Si no hay `skillPoints`, se infieren desde `teamKills * multiplier`.
3. Si `matchpointWin = true`, el bonus se guarda aparte.
4. Si `rawPoints = 999`, no se usa como performance directa.
5. Si falta `totalTeams`, se infiere desde equipos o slots.
6. Todo evento comparte `sourceType` y `sourceId` para agruparlo.

## 7. Calidad de datos

PSR depende de la calidad de la evidencia. Por eso un evento debe clasificarse:

- verificado,
- pendiente,
- disputado,
- importado de historico,
- manual,
- quickmatch,
- torneo oficial.

En futuras versiones, cada tipo de fuente deberia tener un peso formal. En la
version actual, el modelo ya conserva esa metadata para auditoria y backtesting.
