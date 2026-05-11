# Importacion historica desde 00_old

Version del pipeline: `legacy-psr-import-0.1`
Fuente: `../00_old`
Salida staging: `data/legacy-psr/legacy-import.json`
Fuente normalizada de la app: base Prisma (`dev.db` local / base productiva en deploy)
Actualizacion verificada: `2026-05-11`

## Objetivo

El objetivo de esta fase es reemplazar los usuarios ficticios del demo por
jugadores recuperados de las bases historicas de Phoenix. Los Excel no se usan
directamente en la web app: primero se convierten a un JSON de staging auditable
y despues se siembran como `RankingMatchRecord` con `sourceType =
legacy_excel`.

Esta separacion es importante porque los Excel contienen formulas, placeholders,
hojas vacias, columnas movidas y nombres sin ID estable. El PSR debe operar
sobre una base limpia, reproducible y trazable.

## Resultado de la extraccion actual

La extraccion reproducible sobre `00_old` produjo:

- 170 archivos Excel escaneados.
- 156 eventos importables.
- 14 archivos excluidos por no tener bloques de `Resultados` con jugadores
  reales.
- 2,786 equipos importados.
- 8,337 participaciones historicas de jugador.
- 2,843 jugadores unicos normalizados.

Distribucion por tipo de torneo en el staging vigente:

```text
all_skills = 49
only_detri = 41
scrim = 21
pro_am_detri = 18
community = 13
legacy_custom = 13
novice = 1
```

Despues de sembrar la base y recalcular PSR:

- 2,843 usuarios legacy creados o actualizados.
- 8,337 `RankingMatchRecord` historicos.
- 155 eventos PSR rankeables.
- 8,272 deltas de ranking auditables.
- 2,843 snapshots de ranking.

Estado productivo observado despues de integrar la rama actualizada:

```text
ranking total = 2846 jugadores
elegibles = 501
PRO = 101
AM = 200
Detri total filas = 2545
Detri elegibles = 200
eventos PSR persistidos = 155
deltas = 8272
configHash = e6e1a57d30a5d0702e91dbff521a47fd4642d1668cdcb8da43e230cf09817a80
```

La diferencia entre `2,843` jugadores legacy y `2,846` jugadores productivos se
explica por usuarios existentes de la app y/o usuarios de prueba/admin que
conviven con el seed historico.

La diferencia entre 156 eventos importados y 155 eventos PSR rankeables se debe
a la politica del modelo: eventos `novice` se conservan como historico, pero no
mueven el ranking competitivo principal.

## Pipeline operativo

```text
00_old/*.xlsx
  -> scripts/extract_legacy_psr.py
  -> data/legacy-psr/legacy-import.json
  -> prisma/seed-legacy-psr.ts
  -> RankingMatchRecord(sourceType=legacy_excel)
  -> rebuildAndPersistPsrRankings()
  -> RankingEventLog + RankingDelta + RankingSnapshot + User.psr*
```

Comandos:

```bash
npm run legacy:extract
npm run seed:legacy-psr
```

Variables opcionales:

```bash
LEGACY_IMPORT_JSON=data/legacy-psr/legacy-import.json
LEGACY_IMPORT_TOP_PLAYERS=300
LEGACY_IMPORT_MAX_EVENTS=90
```

Si no se definen limites, el seed importa todo lo recuperable.

## Normalizacion aplicada

El extractor recupera de cada torneo:

- archivo fuente y `sourceId` deterministico;
- fecha inferida desde el nombre del archivo;
- tipo de torneo inferido (`all_skills`, `only_detri`, `scrim`,
  `community`, `novice`, etc.);
- equipos, placement final, grupo, rondas jugadas;
- kills por mapa y jugador;
- kills de equipo, puntos de equipo y puntos legacy;
- banderas de compliance detectables (`paymentVerified`,
  `discordVerified`, `photoVerified`, `flyerVerified`);
- resultados por ronda para auditoria.

Tambien excluye handles tecnicos de plantilla como `Equipo 49.1`, `Total`,
`Lugar`, `Multiplicador`, `Puntos`, `TBD` y equivalentes. Si una plantilla trae
placeholders en `Resultados` pero nombres reales en `Registro`, el extractor
intenta cruzarlos por numero de equipo y posicion del jugador.

## Identidad de jugadores

Los Excel no traen un ID universal de jugador. Por eso esta fase usa el handle
normalizado como identidad historica provisional.

Cada usuario legacy recibe:

```text
email tecnico = legacy+<handle-normalizado>.<hash-corto>@phoenix.local
passwordHash = legacy-excel-import-no-login
region = legacy-import
```

El hash corto evita fusionar jugadores distintos cuyos handles se limpian igual
al quitar caracteres especiales. Esta identidad es suficiente para backtesting,
demo realista e historial inicial, pero antes de mover dinero se recomienda una
tabla formal de aliases:

```text
LegacyPlayerAlias(normalizedHandle, userId, confidence, reviewedBy, reviewedAt)
```

## Regla ante duplicados dentro del mismo evento

Un jugador no debe mover dos veces el rating en el mismo evento. Si el historico
contiene mas de una fila para el mismo jugador dentro del mismo `sourceId`, PSR
elige una sola entrada: la competitivamente mas fuerte segun puntos de habilidad,
kills y placement. Esto evita que errores de captura inflen el rating.

El dato original queda como `RankingMatchRecord`; el delta de ranking queda
normalizado en `RankingDelta`.

## Que lee la web app

La web app no debe consultar Excel en runtime. La app lee:

- `User.psrScore`, `psrMu`, `psrSigma`, `psrMatches` para ranking rapido;
- `RankingSnapshot` para tabla y cortes historicos;
- `RankingDelta` para historial por jugador;
- `RankingMatchRecord` para evidencia fuente;
- `RankingEventLog` para reproducibilidad y hash del evento.

La version actual de `/ranking` prioriza `RankingSnapshot` persistido para
evitar timeouts y mantener la tabla alineada con el ultimo rebuild auditado. El
frontend recibe una primera pagina de `250` jugadores y despues consulta
`GET /api/ranking` para hidratar el ranking completo.

Esto permite que la pagina cargue rapido y que el modelo sea auditable.

## Como entra informacion nueva despues de cada partida

Hay tres niveles posibles:

1. Captura manual admin.
   El admin captura resultados, evidencia, equipos, kills, placement y banderas
   de compliance. Es lo mas realista si no existe API oficial confiable.

2. Importacion semiautomatica.
   El organizador sube CSV/Excel/export del torneo. Se corre un parser parecido
   al legacy, se muestra una pantalla de revision de aliases y luego se publica
   al PSR.

3. Ingesta automatica desde servidor.
   Si el juego, proveedor de torneos o servidor privado entrega una API
   autorizada con match id, roster, kills, placement y timestamps, la app puede
   crear `RankingMatchRecord` automaticamente. Esa ingesta debe guardar payload
   crudo, firma/hash, origen, version del parser y estado de verificacion.

En todos los casos, PSR debe recibir la misma forma canonica:

```text
playerId, sourceId, tournamentType, date, placement, totalTeams, kills,
roundsPlayed, averagePlacement, teamKills, skillPoints, evidenceUrl,
verified, complianceFlags
```

## Recomendacion arquitectonica

Para dinero real, la arquitectura madura deberia ser:

```text
Game/server export/API
  -> RawIngestionEvent
  -> NormalizedMatchResult
  -> Admin review / automated validation
  -> RankingMatchRecord
  -> PSR rebuild job
  -> immutable RankingEventLog + RankingDelta
```

La captura manual no desaparece; funciona como fallback y como herramienta de
disputa. Lo importante es que cualquier fuente, manual o automatica, termine en
la misma tabla canonica y deje rastro auditable.

## Riesgo pendiente: resolucion formal de aliases

El import actual usa handles normalizados como identidad historica provisional.
Esto es suficiente para demo, backtesting inicial y trazabilidad, pero no debe
ser el mecanismo final si hay dinero real. Antes de activar pagos ligados a
historial competitivo, se recomienda implementar:

```text
LegacyPlayerAlias(
  normalizedHandle,
  rawHandle,
  userId,
  confidence,
  sourceFile,
  reviewedBy,
  reviewedAt,
  status
)
```

Esa tabla permitiria fusionar identidades revisadas, separar homonimos y dejar
constancia de quien aprobo cada relacion entre historico y usuario real.
