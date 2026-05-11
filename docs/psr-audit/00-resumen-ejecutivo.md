# Resumen Ejecutivo

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

## Decision critica

PSR debe mantenerse separado de `trust_score`. La habilidad competitiva no es lo
mismo que confianza operativa. Un jugador puede ser muy habil pero riesgoso si
presenta evidencia inconsistente; tambien puede ser confiable pero aun no tener
nivel competitivo.
