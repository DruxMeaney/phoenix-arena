# Estado Actual de Base, Ranking y Deploy

Fecha de corte: `2026-05-11`
Expediente: `psr-audit-0.2`
Modelo: `psr-0.1-draft`
Schema de captura: `psr-legacy-v1`

## 1. Estado productivo

```text
URL publica = https://phoenix-arena.vercel.app
Repositorio = DruxMeaney/phoenix-arena
Rama productiva Vercel = main
Deploy = READY
Commit productivo = 5983d1a
```

Vercel esta conectado a la rama `main`. Cuando una rama secundaria se mergea a
`main` y el build pasa, Vercel publica automaticamente una nueva version en la
URL productiva.

## 2. Estado del ranking

Datos observados desde `GET /api/ranking`:

```text
totalPlayers = 2846
eligible = 501
PRO = 101
AM = 200
Detri total = 2545
Detri elegibles = 200
calibrating = 2345
decaying = 2822
events = 155
deltas = 8272
modelVersion = psr-0.1-draft
configHash = e6e1a57d30a5d0702e91dbff521a47fd4642d1668cdcb8da43e230cf09817a80
```

Nota: `stats.detri = 200` cuenta Detri elegibles. El total por tier observado en
las filas es `Detri = 2545`, porque incluye jugadores en calibracion.

## 3. Distribucion PSR observada

```text
min = -9.1
p25 = -2.3
mediana = -0.5
p75 = 1.9
max = 28.6
```

Interpretacion:

- La mediana cerca de cero es esperada con el prior conservador.
- Los mejores jugadores tienen PSR positivo alto porque combinan `mu` elevado y
  `sigma` menor.
- El gran bloque en calibracion no debe interpretarse como mal desempeno; indica
  falta de evidencia suficiente para publicacion competitiva fuerte.
- El decay activo en gran parte de la base refleja que los eventos historicos
  son antiguos frente a la fecha actual.

## 4. Top 10 observado

```text
rank  jugador    PSR   mu       sigma   matches
1     Dongy      28.6  40.9095  4.0955  45
2     Ketchup    27.1  38.6247  3.8557  53
3     Newbz      26.6  39.6487  4.3548  31
4     Shifty     25.0  37.5568  4.1854  30
5     Hisoka     24.4  38.7709  4.7792  22
6     Anziety    23.7  35.9655  4.0783  31
7     Bigman     23.7  35.6654  3.9873  33
8     Natedogg   23.6  35.6589  4.0220  33
9     Cythe      23.1  35.1651  4.0111  31
10    Amir       22.3  33.5557  3.7477  42
```

## 5. Base historica de origen

`data/legacy-psr/legacy-import.json` contiene:

```text
eventos = 156
archivos fuente importados = 156
equipos = 2786
participaciones = 8337
jugadores unicos normalizados = 2843
```

Distribucion de eventos:

```text
all_skills = 49
only_detri = 41
scrim = 21
pro_am_detri = 18
community = 13
legacy_custom = 13
novice = 1
```

El evento `novice` se conserva como historico, pero no mueve el ranking
principal. Por eso produccion muestra `155` eventos PSR persistidos.

## 6. Flujo de lectura actual

```text
RankingSnapshot ultimo
  -> getLatestPersistedPsrRankingSnapshot()
  -> GET /api/ranking
  -> /ranking
```

La pagina de ranking hace SSR con los primeros `250` registros y luego hidrata
la tabla completa. Este diseno evita recalculos costosos en visitas publicas y
mantiene la tabla alineada con el ultimo rebuild.

## 7. Variables operativas configuradas

Produccion tiene variables para:

```text
DATABASE_URL
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
DISCORD_REDIRECT_URI
NEXT_PUBLIC_BASE_URL
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_MODE
ENABLE_DEV_LOGIN
NEXT_PUBLIC_ENABLE_DEV_LOGIN
```

PayPal esta en `sandbox`. `ENABLE_DEV_LOGIN` y
`NEXT_PUBLIC_ENABLE_DEV_LOGIN` estan configuradas para no exponer el login de
desarrollo en produccion.

## 8. Estado de confiabilidad

### Verificado

- Build local pasa.
- Deploy Vercel desde `main` esta `READY`.
- `/`, `/torneos`, `/wallet` y `/ranking` responden `200`.
- `/api/ranking` responde stats y filas.
- Credenciales PayPal sandbox obtienen OAuth `Bearer`.
- No se observaron errores recientes de Vercel en `main` durante la revision.

### Pendiente antes de dinero real

- Backtest estadistico formal contra `00_old`.
- Revision de outliers del top.
- Conciliacion financiera contra proveedores.
- Rotacion de credenciales antes de pasar de sandbox a live.
- Ledger/idempotencia mas estricta para `Transaction`.
- Resolucion formal de aliases historicos.
