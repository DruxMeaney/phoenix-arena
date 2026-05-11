# Auditoria, Gobernanza y Reproducibilidad

## 1. Principio de reproducibilidad

Todo ranking publicado debe poder responder:

- que eventos lo generaron,
- que version del modelo se uso,
- que parametros estaban activos,
- cual era el rating previo,
- cual fue el rating posterior,
- que evidencia respaldo cada evento,
- si hubo correcciones o disputas.

## 2. Auditoria de evento

Cada evento procesado debe tener:

```text
sourceType
sourceId
modelVersion
seasonId
payload
resultHash
evidenceUrl
status
occurredAt
```

El `resultHash` permite detectar si el resultado procesado cambio.

## 3. Auditoria de jugador

Para cada jugador, `RankingDelta` conserva:

```text
muBefore
sigmaBefore
psrBefore
muAfter
sigmaAfter
psrAfter
deltaPsr
placement
kills
lobbyStrength
performanceSignal
explanation
```

La explicacion JSON incluye:

- tipo de evento,
- peso de resultado,
- ajuste por performance,
- numero de partida de calibracion,
- verificacion,
- rondas jugadas,
- average placement,
- average kills,
- skill points,
- raw points,
- matchpoint.

## 4. Separacion entre habilidad y confianza

PSR no debe mezclar habilidad competitiva con confianza operativa.

```text
skill_rating = habilidad estimada
trust_score = riesgo operativo / confiabilidad
```

Ejemplo:

- Jugador muy habil con evidencia dudosa: PSR alto, trust bajo.
- Jugador confiable pero nuevo: trust alto, PSR en calibracion.

Esta separacion es necesaria para decisiones justas:

- matchmaking,
- torneos,
- pagos,
- revision manual,
- limites de participacion.

## 5. Gobernanza de versiones

Cada cambio al modelo debe producir:

- nueva version,
- changelog,
- parametros congelados,
- razon del cambio,
- backtest comparativo,
- fecha de activacion,
- plan de rollback.

Ejemplo:

```text
psr-0.1-draft -> psr-0.2-legacy-shadow -> psr-1.0-production
```

## 6. Criterios para activar uso monetario completo

Antes de usar PSR como criterio final de premios, se recomienda demostrar:

- estabilidad del top 10,
- prediccion razonable de resultados futuros,
- bajo impacto de una sola partida extrema,
- ausencia de sesgos evidentes por region/modalidad,
- funcionamiento de disputas,
- logs completos,
- posibilidad de recalculo desde cero.

## 7. Reglas de intervencion admin

Un admin puede corregir un resultado, pero el sistema debe:

1. guardar el nuevo resultado,
2. eliminar/regenerar registros derivados de ese evento,
3. reconstruir PSR,
4. dejar nuevo `RankingEventLog`,
5. reflejar nuevos `RankingDelta`.

Nunca se debe editar manualmente `psrScore` como fuente primaria.
