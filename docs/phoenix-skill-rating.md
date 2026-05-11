# Phoenix Skill Rating (PSR)

Version implementada: `psr-0.1-draft`

Esquema de captura de torneos: `psr-legacy-v1`

Actualizacion de auditoria: `2026-05-11`

Expediente extendido: `docs/psr-audit/`

## Objetivo

Phoenix Skill Rating es la propuesta de ranking competitivo para Phoenix Arena. Su objetivo es clasificar jugadores de forma robusta, auditable y explicable cuando la plataforma tenga torneos, retos y premios con dinero.

El principio central es simple: el ranking publico no debe ser una suma opaca de puntos. Debe estimar habilidad, medir incertidumbre y dejar evidencia suficiente para reconstruir cualquier posicion de la tabla.

## Base metodologica

PSR esta implementado como un modelo bayesiano conservador inspirado en sistemas publicados y usados en competencia:

- TrueSkill, de Microsoft Research, modela habilidad como una distribucion y permite partidas con equipos y multiples participantes.
- Glicko-2, de Mark Glickman, agrega incertidumbre y volatilidad sobre el rating.
- OpenSkill ofrece una familia abierta de modelos de rating bayesiano para escenarios multiplayer.

La forma usada por Phoenix Arena es cercana a TrueSkill/OpenSkill:

```text
R_i ~ N(mu_i, sigma_i^2)
```

Donde:

- `mu_i` es la estimacion central de habilidad del jugador.
- `sigma_i` es la incertidumbre sobre esa estimacion.
- `R_i` es la variable latente de habilidad.

El ranking visible debe ser conservador:

```text
PSR_i = mu_i - 3 * sigma_i
```

Esto evita que jugadores con pocas partidas suban demasiado rapido por una muestra pequena. Un jugador nuevo puede tener alto potencial, pero su posicion publica solo mejora cuando reduce incertidumbre con evidencia repetida.

## Estado implementado

La version `psr-0.1-draft` ya esta aplicada en el proyecto:

- Motor matematico: `src/lib/scoring/psr.ts`
- Servicio de reconstruccion, persistencia y snapshot: `src/lib/ranking/psr-service.ts`
- API publica de ranking: `GET /api/ranking`
- Rebuild auditado admin-only: `POST /api/ranking`
- Pagina de ranking PSR: `src/app/ranking`
- Migracion de auditoria: `prisma/migrations/20260506052048_add_psr_audit`

El modelo corre en estado `shadow`: calcula PSR real, persiste deltas cuando se confirma un resultado o cuando un admin ejecuta rebuild, pero todavia debe validarse con historico antes de usarse como criterio final de premios.

Estado productivo observado el `2026-05-11`:

```text
URL = https://phoenix-arena.vercel.app
rama Vercel = main
deploy = READY
commit = 5983d1a
totalPlayers = 2846
eligible = 501
events = 155
deltas = 8272
configHash = e6e1a57d30a5d0702e91dbff521a47fd4642d1668cdcb8da43e230cf09817a80
```

La app ya contiene wallet, PayPal sandbox, MercadoPago en codigo, reembolsos y
premios por torneo. Por eso la auditoria ampliada separa tres dominios:

```text
PSR = habilidad y ranking
captura = evidencia competitiva
ledger = saldos, pagos, reembolsos y premios
```

## Integracion de parametros historicos `00_old`

El analisis de los archivos historicos encontro que esos torneos no usaban PSR; usaban una captura operacional con registros de equipo, jugadores, rondas, placement, kills, subtotal, verificaciones y casos de Matchpoint.

La integracion aplicada conserva esa informacion como evidencia de torneo, pero no reemplaza el modelo PSR. La regla es:

```text
captura historica enriquecida -> RankingMatchRecord -> reconstruccion PSR -> RankingDelta/Snapshot
```

Los parametros recuperados que ahora se pueden guardar por torneo son:

- equipo: `teamName`, `teamNumber`, `teamGroup`, `rosterSlot`, `captainHandle`
- identidad operativa: `rawHandle`, `normalizedHandle`
- resultado final: `placement`, `kills`, `deaths`
- rondas/mapas: `roundsPlayed`, `averagePlacement`, `averageKills`, `roundResults`
- desempeno de equipo: `teamKills`, `skillPoints`, `rawPoints`
- Matchpoint: `matchpointWin`, `matchpointBonus`
- verificacion: `paymentVerified`, `discordVerified`, `photoVerified`, `flyerVerified`, `rulesAccepted`, `adminVerified`
- auditoria: `sourceType`, `sourceId`, `sourceHash`, `captureSchemaVersion`, `evidenceUrl`

La formula legacy observada queda documentada y reproducible:

```text
skillPoints_round = teamKills_round * placementMultiplier(placement_round)

placementMultiplier(0)     = 0
placementMultiplier(1)     = 1.6
placementMultiplier(2..5)  = 1.4
placementMultiplier(6..10) = 1.2
placementMultiplier(11+)   = 1.0
```

En eventos con Matchpoint, el bono historico hacia que el total bruto llegara a `999`. PSR no usa ese `999` como performance porque distorsionaria el rating. En su lugar:

- `skillPoints` guarda el desempeno competitivo sin el bono.
- `rawPoints` puede guardar el total historico bruto.
- `matchpointBonus` guarda la diferencia.
- `matchpointWin` deja el marcador auditado.
- El resultado competitivo principal sigue siendo el placement y el update bayesiano PSR.

## Captura admin aplicada

La pantalla de captura de resultados de torneo ahora permite registrar datos compatibles con `00_old`: equipo, grupo, kills, deaths, placement, rondas, promedio de placement, kills de equipo, puntos skill, Matchpoint y checks de verificacion.

Al guardar un torneo, el API:

1. Normaliza los campos capturados.
2. Calcula `skillPoints` con la formula legacy si el admin no los escribe manualmente.
3. Separa `rawPoints` y `matchpointBonus` para que el `999` no entre al PSR.
4. Guarda `TournamentResult` como registro operativo auditable.
5. Recrea `RankingMatchRecord` para el evento completo.
6. Ejecuta `rebuildAndPersistPsrRankings()`.
7. Persiste `RankingEventLog`, `RankingDelta` y `RankingSnapshot`.

## Parametros activos

```text
modelVersion = psr-0.1-draft
initialMu = 25
initialSigma = 25 / 3
beta = 25 / 6
tau = 25 / 300
publicScore = mu - 3 * sigma
minRankedMatches = 4
```

La incertidumbre `sigma` baja con evidencia y sube por inactividad. La performance individual tiene un ajuste acotado para que kills y stats ayuden a explicar el resultado sin dominarlo.

## Evidencia por partida

Cada evento rankeable debe guardar, como minimo:

- `event_id`
- `model_version`
- `season_id`
- `tournament_id` o `match_id`
- `started_at` y `completed_at`
- participantes y equipos
- tipo de torneo o pool competitivo
- placement final
- kills u otras metricas individuales disponibles
- evidencia externa: captura, API, reporte admin o resolucion de disputa
- rating previo y posterior de cada jugador
- delta explicado por jugador

Ningun resultado con impacto economico deberia entrar al ranking sin poder reconstruirse desde este registro.

En esta implementacion, los retos confirmados crean registros `RankingMatchRecord` con:

- `eventId = match.id`
- `sourceType = quickmatch`
- `sourceId = result.id`
- `verified = true`
- `modelVersion = psr-0.1-draft`
- placement 1 para ganador y ultimo placement para perdedor

Despues se ejecuta una reconstruccion PSR que persiste `RankingEventLog`, `RankingDelta` y `RankingSnapshot`.

## Update de rating

El update bayesiano debe usar tres senales:

```text
delta_i = posterior(resultado, fuerza_lobby, performance_individual_acotada)
```

1. Resultado competitivo
   El orden final, victoria/derrota o placement es la senal principal.

2. Fuerza del lobby
   Ganar contra jugadores fuertes debe mover mas que ganar contra jugadores debiles.

3. Performance individual acotada
   Kills y estadisticas individuales ayudan a explicar contribucion, pero deben tener retornos decrecientes y topes para evitar stat padding.

La implementacion actual procesa cada evento en orden cronologico. Si un evento tiene varios participantes, aplica comparaciones por pares al estilo TrueSkill:

```text
c = sqrt(2 * beta^2 + sigma_w^2 + sigma_l^2)
t = (mu_w - mu_l) / c
v = N(t) / Phi(t)
w = v * (v + t)
```

El ganador recibe ajuste positivo y el perdedor ajuste negativo; ambos reducen incertidumbre segun la informacion aportada por el resultado. En eventos individuales o historicos sin lobby completo, el sistema aplica evidencia provisional acotada y conserva mas incertidumbre.

La senal de performance individual queda acotada y ahora usa los parametros historicos asi:

- `placement` sigue siendo la senal dominante.
- `averagePlacement` ayuda a distinguir consistencia por mapa sin reemplazar el resultado final.
- `averageKills` normaliza kills por rondas para no premiar simplemente torneos mas largos.
- `skillPoints` usa kills de equipo por placement multiplier, sin incluir Matchpoint `999`.
- `rawPoints`, `matchpointWin` y `matchpointBonus` se guardan para auditoria, no como multiplicador directo de habilidad.

## Separacion entre habilidad y confianza

PSR no debe mezclar habilidad con confianza operativa.

- `skill_rating`: clasifica nivel competitivo.
- `trust_score`: controla riesgo, verificacion, acceso a pools y revision manual.

Esto importa porque un jugador puede ser habil pero riesgoso, o confiable pero todavia no competitivo.

## Pools y tiers

Los tiers deben salir del percentil sobre jugadores elegibles:

```text
PRO   = percentil >= 80
AM    = percentil >= 40
Detri = percentil < 40
```

Regla minima recomendada:

- Un jugador no entra al pool elegible hasta completar `k` partidas rankeables.
- Mientras esta en calibracion, aparece con estado `calibrando`.
- Torneos `novice` no afectan premios ni ranking principal.

## Auditoria

Todo snapshot del ranking debe poder responder:

- Que version del algoritmo calculo esta posicion?
- Que partidas explican el rating actual?
- Cual era el rating antes y despues de cada partida?
- Que parametros estaban activos?
- Hubo disputa o revision manual?
- El cambio fue reproducible al recalcular desde cero?

Para eso se recomienda guardar:

```text
RankingEventLog
RankingSnapshot
RankingModelVersion
RankingDelta
DisputeResolution
```

Ya estan implementados `RankingEventLog`, `RankingSnapshot`, `RankingModelVersion` y `RankingDelta`. `DisputeResolution` se mantiene cubierto por el modelo existente `Dispute`; si el flujo legal crece, conviene conectar cada disputa a los deltas que bloqueo o corrigio.

## Modelo de datos aplicado

Campos agregados a `User`:

- `psrMu`
- `psrSigma`
- `psrScore`
- `psrMatches`
- `peakPsr`
- `psrModelVersion`
- `psrLastEventAt`

Campos agregados a `RankingMatchRecord`:

- `eventId`
- `seasonId`
- `sourceType`
- `sourceId`
- `evidenceUrl`
- `verified`
- `modelVersion`
- `psrProcessedAt`
- `teamName`, `teamNumber`, `teamGroup`
- `roundsPlayed`, `averagePlacement`, `averageKills`
- `skillPoints`, `rawPoints`, `matchpointWin`, `matchpointBonus`
- `roundResults`, `complianceFlags`, `captureSchemaVersion`

Campos agregados a `Tournament`:

- `scoringModel`
- `captureSchemaVersion`
- `mapCount`
- `ranked`
- `psrWeight`
- `captureMeta`

Campos agregados a `TournamentResult`:

- `teamName`, `teamNumber`, `teamGroup`, `rosterSlot`, `captainHandle`
- `rawHandle`, `normalizedHandle`
- `roundsPlayed`, `averagePlacement`, `averageKills`
- `skillPoints`, `rawPoints`, `matchpointWin`, `matchpointBonus`
- `paymentVerified`, `discordVerified`, `photoVerified`, `flyerVerified`, `rulesAccepted`, `adminVerified`
- `sourceType`, `sourceHash`, `captureSchemaVersion`, `roundResults`, `complianceFlags`

Tablas agregadas:

- `RankingModelVersion`
- `RankingEventLog`
- `RankingDelta`
- `RankingSnapshot`

## Backtesting antes de premios

Antes de activar PSR para pagos o premios, correr pruebas con historico:

- estabilidad semanal del top 10
- correlacion entre rating y resultados futuros
- sensibilidad a una sola partida extrema
- comparacion contra el score actual
- sesgo por tipo de torneo, region o modalidad
- comportamiento de jugadores nuevos
- comportamiento tras inactividad
- casos con disputas o evidencia incompleta

Base disponible para esa validacion:

```text
156 eventos extraidos desde 00_old
155 eventos rankeables
8337 participaciones historicas
2843 jugadores legacy normalizados
```

El expediente `docs/psr-audit/08-validacion-empirica.md` define criterios
propuestos para estabilidad, predictividad, outliers y calibracion.

## Fases de implementacion

### Fase 1: Transparencia y baseline

- Publicar esta metodologia. Estado: aplicado.
- Mantener el score previo como referencia historica. Estado: aplicado.
- Registrar cada partida con version de algoritmo. Estado: aplicado para resultados confirmados.
- Mostrar estado de calibracion, decay y elegibilidad. Estado: aplicado en la pagina de ranking.

### Fase 2: PSR en modo sombra

- Agregar `mu`, `sigma`, `psr` y `modelVersion`. Estado: aplicado.
- Calcular PSR en paralelo al score previo. Estado: aplicado.
- Comparar resultados durante varias semanas. Estado: pendiente de datos reales.
- Revisar outliers con admins y jugadores expertos. Estado: pendiente.

### Fase 3: PSR v1.0 para competencia monetizada

- Congelar parametros.
- Publicar changelog.
- Activar snapshots por temporada.
- Abrir mecanismo formal de disputa.
- Usar PSR como criterio oficial de clasificacion y premios.

Bloqueadores actuales antes de `psr-1.0-production`:

- backtest formal con `00_old`;
- resolucion de aliases historicos;
- pruebas de sensibilidad por modalidad;
- politica de disputa conectada a cambios de PSR;
- deshabilitar deposito manual de desarrollo en produccion;
- envolver inscripcion wallet-only en transaccion atomica;
- agregar idempotencia/ledger mas fuerte para `Transaction`;
- conciliacion diaria contra PayPal/MercadoPago;
- rotacion de credenciales antes de modo live.

## Referencias

- TrueSkill, Microsoft Research: https://www.microsoft.com/en-us/research/?p=154591
- Glicko-2, Mark Glickman: https://www.glicko.net/glicko/glicko2.html
- OpenSkill paper: https://arxiv.org/abs/2401.05451
