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
soloEvidence.maxMuAdjustment = 0.28
soloEvidence.sigmaShrink = 0.985
decay.inactivityThresholdDays = 30
decay.sigmaIncreasePerMonth = 0.45
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

### Parametros de evidencia incompleta

Controlan eventos donde no existe lobby completo o la senal de comparacion es
mas debil:

- `soloEvidence.maxMuAdjustment`
- `soloEvidence.sigmaShrink`

Su objetivo es permitir que una participacion individual aporte informacion sin
inflar el rating como si hubiera una tabla completa de rivales.

### Parametros de inactividad

Controlan el aumento de incertidumbre cuando un jugador deja de competir:

- `decay.inactivityThresholdDays = 30`
- `decay.sigmaIncreasePerMonth = 0.45`

El decaimiento no baja `mu`; aumenta `sigma` y por tanto reduce el PSR publico
conservador hasta que haya nueva evidencia.

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

Extraccion reproducible vigente (`data/legacy-psr/legacy-import.json`):

```text
eventos importados = 156
archivos fuente importados = 156
equipos = 2786
participaciones historicas = 8337
jugadores unicos normalizados = 2843
```

Distribucion por tipo de torneo:

```text
all_skills = 49
only_detri = 41
scrim = 21
pro_am_detri = 18
community = 13
legacy_custom = 13
novice = 1
```

Estado productivo posterior al seed y rebuild:

```text
jugadores en ranking = 2846
jugadores elegibles = 501
eventos PSR rankeables = 155
deltas auditables = 8272
```

La diferencia entre `156` eventos importados y `155` eventos PSR rankeables se
debe a la politica actual: eventos `novice` se preservan como historico, pero no
mueven el ranking competitivo principal.

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

La captura admin actual tambien registra metadatos de torneo en
`Tournament.captureMeta`:

```text
captureSchemaVersion
scoringModel
sourceType
sourceId
seasonId
totalTeams
mapCount
verified
submittedBy
submittedAt
legacyPlacementFormula
matchpointTarget
matchpointBonusExcludedFromPsr
```

Este bloque permite responder quien cargo el resultado, con que schema, que
formula legacy se aplico y si el Matchpoint `999` fue excluido del PSR.

## 6. Reglas de normalizacion

1. Si hay `roundResults`, se calculan subtotales por mapa.
2. Si no hay `skillPoints`, se infieren desde `teamKills * multiplier`.
3. Si `matchpointWin = true`, el bonus se guarda aparte.
4. Si `rawPoints = 999`, no se usa como performance directa.
5. Si falta `totalTeams`, se infiere desde equipos o slots.
6. Todo evento comparte `sourceType` y `sourceId` para agruparlo.
7. Si un jugador aparece dos veces en el mismo evento, PSR conserva para el
   update la entrada competitivamente mas fuerte segun `skillPoints`, kills y
   placement. Los registros fuente siguen disponibles como evidencia.
8. `verified` en `RankingMatchRecord` depende del evento y de `adminVerified`
   para resultados capturados por torneo.

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

## 8. Datos monetarios asociados a torneos

La base actual tambien captura variables monetarias que no forman parte del PSR,
pero si del contexto de auditoria:

```text
Tournament.entryFee
Tournament.prizePool
Tournament.prizeDistribution
Tournament.customPrizeSplits
TournamentEntry.paidAmount
TournamentEntry.discountAmount
Wallet.balance
Wallet.heldBalance
Transaction.type
Transaction.amount
Transaction.status
Transaction.reference
```

Regla metodologica: estos campos no deben alimentar `mu` ni `sigma`. Sirven para
auditar pagos, reembolsos, premios y comisiones. PSR debe consumir resultados
competitivos verificados; el subsistema financiero debe consumir transacciones
idempotentes y reglas de premio versionadas.
