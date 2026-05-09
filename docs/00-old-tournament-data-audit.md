# 00_old Tournament Data Audit

Fecha de revision: 2026-05-08

## Resumen ejecutivo

La carpeta `00_old` contiene historico operativo de torneos/customs/scrims de Phoenix Arena en archivos Excel. No parece ser el mismo modelo PSR implementado en la plataforma; es una plantilla de administracion de eventos con registro de equipos, resultados por ronda/mapa, calculo de puntos por kills y placement, tablas ordenadas, directorio de jugadores y espacio futuro para baneos.

El material es muy valioso para PSR porque puede convertirse en evidencia historica para:

- calibrar jugadores antes de que usen la plataforma nueva,
- correr backtests del ranking PSR,
- detectar aliases/handles repetidos,
- medir fuerza de lobby por tipo de evento,
- separar skill rating de trust/compliance.

No debe importarse directamente como ranking oficial sin limpieza. Hay formulas, placeholders, bonuses de matchpoint y formatos acumulados que contaminarian el rating si se usan sin normalizacion.

## Inventario

- Archivos analizados: 171 Excel (`.xlsx` y un `.xlsm`).
- Tamano total aproximado: 76 MB.
- Errores de lectura: 0.
- Registros detectados en agregado:
  - 8,514 registros de equipos en hojas de registro.
  - 25,539 registros de participacion de jugadores.
  - 2,243 handles unicos aproximados, normalizados solo por minusculas.
  - 2,679 filas de resultados por equipo.
  - 6,937 registros de kills/rondas por jugador.

## Estructura comun

Todas las plantillas comparten estas hojas:

- `Instrucciones`
- `Registro`
- `Resultados`
- `Subtotal`
- `Lista de equipos (Trios)`
- `Tabla de posiciones`
- `Baneos`

Hojas opcionales frecuentes:

- `Switcharoo`: aparece en 102 archivos.
- `Jugadores`: aparece en 81 archivos.
- `Tabla Admin`: aparece en 30 archivos.

Patrones principales de plantilla:

- 81 archivos: plantilla con `Switcharoo` y `Jugadores`.
- 38 archivos: plantilla base sin `Switcharoo`, `Jugadores` ni `Tabla Admin`.
- 28 archivos: plantilla con `Tabla Admin`.
- 19 archivos: plantilla con `Switcharoo` pero sin `Jugadores`.

## Tipos de eventos inferidos por nombre

Categorias aproximadas:

- `Only/Detri`: 58
- `All Skills`: 54
- `Scrims`: 24
- `Rebirth`: 19
- `Havens Hollow`: 16
- `Community`: 14
- `WSOW`: 12
- `GTD/Prize`: 8
- `COED`: 6
- `EWC`: 4
- `Pro/AM/Detri`: 3
- `Female`: 3
- `Tryouts`: 3
- `Novice`: 1

Hay eventos de enero a diciembre. El ano no esta en la mayoria de los nombres; antes de importar debe confirmarse con admins o inferirse desde metadatos confiables del archivo.

## Modelo de scoring encontrado

La hoja `Resultados` captura por equipo:

- jugadores del equipo,
- kills por jugador y ronda,
- total de kills por ronda,
- placement/lugar por ronda,
- multiplicador por placement,
- puntos por ronda,
- indicador de `Matchpoint win`,
- total,
- rondas jugadas,
- grupo.

Formula observada de multiplicador por placement:

```text
si placement = 0        => 0
si placement > 10       => 1.0
si placement 6-10       => 1.2
si placement 2-5        => 1.4
si placement = 1        => 1.6
```

Formula de puntos por ronda:

```text
puntos_ronda = kills_equipo_ronda * multiplicador_placement
```

Formula observada para matchpoint:

```text
si alguna celda de Matchpoint win esta activa:
  bonus_matchpoint = 999 - suma(puntos_ronda)
  total = suma(puntos_ronda) + bonus_matchpoint
```

Esto fuerza al ganador por matchpoint a terminar con `999` puntos. Para PSR, ese `999` no debe tratarse como performance numerica. Debe guardarse como marcador de victoria/evento y separarse del puntaje normalizado.

## Hojas y senales utiles

### Registro

Contiene registro manual y/o por formulario.

Campos frecuentes:

- equipo,
- capitan,
- jugadores 2 y 3,
- grupo,
- pago,
- Discord,
- foto,
- flyer,
- permisos,
- reglas.

Interpretacion:

- Equipo y jugadores alimentan identidad historica.
- Pago/Discord/foto/flyer/permisos/reglas son senales de compliance/trust, no de habilidad.

### Resultados

Es la fuente mas cercana al evento crudo.

Uso recomendado:

- extraer kills por jugador por ronda,
- placement por equipo por ronda,
- matchpoint separado,
- rondas reales jugadas,
- grupo/lobby.

### Subtotal

Contiene agregados por equipo y jugador:

- puntos por equipo,
- matchpoint,
- rondas,
- grupo,
- kills por jugador,
- rondas por jugador,
- promedio de posicion,
- promedio de kills.

Uso recomendado:

- fuente eficiente para staging,
- validacion contra `Resultados`,
- no usar `Matchpoint win` como puntos reales.

### Tabla de posiciones

Contiene tabla ordenada, pero muchas formulas vienen de Google Sheets (`QUERY`) y quedan como dummy functions al abrir como Excel. Los valores cacheados sirven como referencia, pero la importacion robusta debe partir de `Resultados`/`Subtotal`, no de esta hoja.

### Jugadores

Directorio historico de handles. Es valioso para aliasing, pero no reemplaza identidad.

Riesgos:

- handles con mayusculas/minusculas inconsistentes,
- espacios,
- aliases,
- cambios de nombre,
- nombres de equipo mezclados con nombres de jugador en algunos formatos.

### Baneos

La hoja existe en todos los archivos y las instrucciones dicen que se usara para IDs y nombres baneados. En la muestra revisada aparece vacia o no operacional.

Uso recomendado:

- conectarla a `trustScore`, `trustLevel` e `isFlagged`,
- nunca mezclar baneos con skill rating.

## Riesgos de calidad de datos

1. No hay IDs estables de jugador.
   Hay handles, pero no un identificador universal. Hace falta una tabla de aliases y un flujo de revision.

2. El ano del evento no esta garantizado por el nombre.
   Hay nombres con mes-dia, pero casi nunca ano. Antes de importar ranking historico, se debe confirmar el calendario.

3. `999` de matchpoint contamina totals.
   Debe separarse como `matchpointWin = true` y excluirse de performance numerica.

4. Hay placeholders.
   Muchos equipos aparecen como `Equipo 18`, `Team 49`, etc. Deben excluirse si no tienen jugadores/resultados reales.

5. Hay formatos acumulados o scrims extensos.
   Se detectaron eventos con 50-76 rondas observadas. No deben entrar igual que un custom de 6-10 mapas.

6. Algunas columnas cambian entre plantillas.
   En plantillas nuevas `Tabla Admin` compacta la salida. En algunas lecturas, columnas de grupo/compliance pueden desplazarse.

7. Hay formulas no portables.
   `Tabla de posiciones` depende de funciones de Google Sheets convertidas a dummy functions en Excel.

## Como enriquecer PSR con esta data

La importacion debe pasar por staging, no directo al ranking activo.

### Staging recomendado

Crear una capa `legacy_excel` con entidades normalizadas:

- `LegacyEvent`
  - fileName
  - sourceHash
  - inferredDate
  - confirmedDate
  - eventType
  - format
  - lobby
  - mapCount
  - parserVersion
  - importStatus

- `LegacyTeamResult`
  - eventId
  - teamName
  - placement
  - rawTotalPoints
  - skillPoints
  - matchpointWin
  - rounds
  - group

- `LegacyPlayerResult`
  - eventId
  - teamResultId
  - rawHandle
  - normalizedHandle
  - userId nullable
  - kills
  - rounds
  - teamPlacement
  - teamKills
  - teamSkillPoints

- `LegacyPlayerAlias`
  - normalizedHandle
  - candidateUserId
  - confidence
  - reviewedBy
  - reviewedAt

### Traduccion a PSR

Para cada evento historico validado:

- `sourceType = legacy_excel`
- `sourceId = sha256(fileName + eventKey + parserVersion)`
- `verified = false` al importar inicialmente
- `verified = true` solo despues de revision o regla confiable
- `tournamentType` inferido desde nombre: `all_skills`, `only_detri`, `scrim`, `community`, etc.
- `entries` por jugador, con:
  - placement del equipo,
  - totalTeams validos,
  - kills individuales,
  - teamKills,
  - teamPoints sin bonus de matchpoint,
  - bestKillsInTournament,
  - bestTeamPointsInTournament.

### Estado aplicado en la app

La captura manual de torneos ya integra el esquema `psr-legacy-v1`:

- `TournamentResult` conserva los campos operativos del historico: equipo, grupo, rondas, promedios, puntos legacy, Matchpoint y verificaciones.
- `RankingMatchRecord` recibe esos campos como evidencia para PSR.
- `skillPoints` excluye el bonus Matchpoint.
- `rawPoints` y `matchpointBonus` guardan el total historico bruto para auditoria.
- Al guardar un torneo se reconstruye PSR con `rebuildAndPersistPsrRankings()`.

Lo pendiente para una importacion masiva de `00_old` sigue siendo construir un parser reproducible y una pantalla de revision de aliases.

### Pesos recomendados por tipo de evento

No todos los eventos deben mover el rating principal igual.

- `All Skills`, `Pro/AM/Detri`, `GTD/Prize`: peso alto si hay evidencia consistente.
- `Only Detri`: usar para calibracion y tier Detri/AM, con menor peso para ranking global.
- `Novice`: no deberia afectar ranking principal; usar solo onboarding/calibracion.
- `Scrims`, `Tryouts`: sombra/backtest o peso bajo, porque pueden tener objetivos distintos a competir por premio.
- `Female`, `COED`: conservar etiqueta para auditoria; no mezclar sin revisar sesgo/pool.
- `Community`: peso medio/bajo segun reglas y calidad de evidencia.

## Implicacion para PSR

El hallazgo principal: el historico antiguo es ideal para backtesting y calibracion, pero no sustituye al PSR.

El modelo viejo responde:

```text
Quien gano este evento segun kills, placement y matchpoint?
```

PSR responde:

```text
Que tan fuerte parece ser este jugador, con incertidumbre, frente a la poblacion y segun evidencia acumulada?
```

Por eso la estrategia correcta es:

1. importar historico como eventos auditables,
2. limpiar identidad/aliases,
3. separar skill de trust,
4. quitar bonuses artificiales,
5. correr PSR en shadow,
6. comparar prediccion contra resultados futuros,
7. solo entonces activar impacto en ranking publico o dinero.

## Proxima fase tecnica recomendada

1. Crear parser reproducible para `00_old`.
2. Generar JSON/CSV normalizado de staging.
3. Crear reporte de calidad: eventos importables, eventos sospechosos, eventos excluidos.
4. Crear tabla de aliases y pantalla admin de revision.
5. Correr backtest PSR con historico.
6. Publicar una `model card` de `psr-0.2-legacy-shadow`.
