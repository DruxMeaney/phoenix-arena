# Resumen Ejecutivo

Actualizacion operativa: `2026-05-11`
Version del expediente: `psr-audit-0.2`
Base productiva observada: `2,846` jugadores, `501` elegibles, `155` eventos
PSR persistidos y `8,272` deltas auditables.

Phoenix Arena necesita un sistema de ranking que pueda defenderse tecnica,
metodologica y operativamente. La plataforma no solo muestra perfiles: organiza
competencias, torneos y posibles movimientos de dinero. En ese contexto, un
ranking simple por puntos acumulados es insuficiente porque:

- premia volumen mas que habilidad,
- no distingue incertidumbre,
- puede inflarse con eventos de baja calidad,
- no explica por que un jugador subio o bajo,
- es dificil de auditar ante disputas.

Phoenix Skill Rating (PSR) resuelve este problema con un enfoque bayesiano
conservador inspirado en TrueSkill, Glicko/Glicko-2 y OpenSkill. El modelo
mantiene para cada jugador dos cantidades:

- `mu`: estimacion central de habilidad.
- `sigma`: incertidumbre sobre esa estimacion.

El ranking publico se calcula de forma conservadora:

```text
PSR = mu - 3 * sigma
```

Esta decision es clave. Un jugador nuevo puede tener buen potencial, pero si
hay poca evidencia su `sigma` sera alta y su PSR publico quedara contenido. Con
el tiempo, si compite de forma consistente y verificable, `sigma` baja y el
PSR refleja mejor su habilidad real.

## Por que aplica a Phoenix Arena

Phoenix Arena tiene rasgos que exigen mas que Elo clasico:

- torneos multijugador,
- resultados por placement,
- kills individuales,
- desempeno de equipo,
- datos historicos de torneos,
- evidencia administrativa,
- posibles disputas,
- usuarios nuevos con poca muestra,
- competidores con frecuencia de juego irregular.

Elo fue disenado para escenarios principalmente uno contra uno. Glicko mejora
ese enfoque al modelar incertidumbre. TrueSkill y OpenSkill extienden la logica
bayesiana a escenarios con equipos, multiples participantes y posiciones. PSR
toma esa familia conceptual y la adapta a la realidad operacional del proyecto.

## Que hace auditable al PSR

Cada evento rankeable debe poder reconstruirse desde datos guardados:

- evento de origen,
- jugadores,
- placement,
- kills,
- total de equipos,
- parametros legacy de torneo,
- evidencia,
- version del modelo,
- rating previo,
- rating posterior,
- delta explicado.

La web app ya persiste:

- `RankingMatchRecord`: entrada normalizada para el modelo.
- `RankingEventLog`: evento procesado y hash de resultado.
- `RankingDelta`: cambio por jugador.
- `RankingSnapshot`: estado del ranking en un momento.
- `RankingModelVersion`: version y parametros activos.

Ademas, la version actual de la app ya incorpora flujos de dinero vinculados a
torneos:

- wallet interna con `Wallet` y `Transaction`;
- depositos PayPal en modo sandbox;
- integracion MercadoPago en codigo, actualmente no expuesta como opcion
  principal en la UI;
- inscripcion a torneos con wallet;
- flujos "fund + join" para pagar y entrar a un torneo;
- reembolsos por salida/cancelacion;
- distribucion de premios por presets (`winner_takes_all`, `top_3`, `top_5`,
  `top_8`, `custom`);
- comision de plataforma del `10%` sobre prize pool distribuible;
- comision configurable de retiro, por defecto `5%`.

Esto eleva el estandar de auditoria: PSR no debe documentarse solo como modelo
estadistico, sino como parte de una arquitectura de competencia monetizada.

## Que se espera despues de un tiempo

Despues de varias semanas o meses de operacion, PSR deberia permitir:

- ranking mas estable,
- mejor separacion entre PRO, AM y Detri,
- menor manipulacion por volumen,
- deteccion de outliers,
- explicacion de cada cambio de rating,
- evidencia para disputas,
- prediccion razonable de desempeno futuro,
- base para matchmaking, torneos segmentados y analitica competitiva.

## Estado actual del ranking productivo

El endpoint publico `GET /api/ranking` lee el ultimo snapshot persistido y no
recalcula todo el ranking en cada request. La pagina `/ranking` entrega una
carga inicial de los primeros `250` jugadores y despues hidrata el ranking
completo desde la API. Esta decision protege rendimiento y hace que la tabla
publica coincida con el ultimo estado auditado.

Estado observado el `2026-05-11`:

```text
totalPlayers = 2846
eligible = 501
PRO = 101
AM = 200
Detri total filas = 2545
Detri elegibles = 200
events = 155
deltas = 8272
modelVersion = psr-0.1-draft
configHash = e6e1a57d30a5d0702e91dbff521a47fd4642d1668cdcb8da43e230cf09817a80
```

Top 10 productivo observado:

```text
1. Dongy      PSR 28.6  mu 40.9095  sigma 4.0955  matches 45
2. Ketchup    PSR 27.1  mu 38.6247  sigma 3.8557  matches 53
3. Newbz      PSR 26.6  mu 39.6487  sigma 4.3548  matches 31
4. Shifty     PSR 25.0  mu 37.5568  sigma 4.1854  matches 30
5. Hisoka     PSR 24.4  mu 38.7709  sigma 4.7792  matches 22
6. Anziety    PSR 23.7  mu 35.9655  sigma 4.0783  matches 31
7. Bigman     PSR 23.7  mu 35.6654  sigma 3.9873  matches 33
8. Natedogg   PSR 23.6  mu 35.6589  sigma 4.0220  matches 33
9. Cythe      PSR 23.1  mu 35.1651  sigma 4.0111  matches 31
10. Amir      PSR 22.3  mu 33.5557  sigma 3.7477  matches 42
```

La lectura metodologica importante es que la base historica ya produce un
ranking plausible con jugadores reales; sin embargo, el alto numero de jugadores
en calibracion (`2,345`) y decaimiento (`2,822`) confirma que el modelo debe
seguir comunicando incertidumbre de forma visible.

## Decision critica

PSR debe mantenerse separado de `trust_score`. La habilidad competitiva no es lo
mismo que confianza operativa. Un jugador puede ser muy habil pero riesgoso si
presenta evidencia inconsistente; tambien puede ser confiable pero aun no tener
nivel competitivo.

Decision critica adicional: el saldo, los pagos y los premios tampoco deben
mezclarse con PSR. El ranking puede definir elegibilidad competitiva, seeds o
divisiones, pero el pago de premios debe depender de resultados verificados,
transacciones idempotentes y reglas de torneo versionadas. Una disputa de pago
debe poder resolverse aunque no se modifique el rating, y una correccion de PSR
no debe mover dinero sin una decision administrativa separada.
