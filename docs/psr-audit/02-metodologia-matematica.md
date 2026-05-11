# Metodologia Matematica del PSR

## 1. Estado latente del jugador

Cada jugador `i` tiene un estado:

```text
S_i = (mu_i, sigma_i, matches_i, peak_i, last_event_i)
```

Donde:

- `mu_i`: estimacion central de habilidad.
- `sigma_i`: incertidumbre sobre la habilidad.
- `matches_i`: numero de eventos rankeables.
- `peak_i`: mejor PSR historico.
- `last_event_i`: ultimo evento procesado.

El prior inicial es:

```text
mu_0 = 25
sigma_0 = 25 / 3
```

## 2. Puntaje publico conservador

El puntaje visible no es `mu`. Es:

```text
PSR_i = mu_i - 3 * sigma_i
```

La constante `3` es deliberadamente conservadora. Penaliza la incertidumbre y
evita que jugadores con poca muestra aparezcan artificialmente arriba.

Ejemplo:

```text
Jugador A: mu = 30, sigma = 8
PSR = 30 - 24 = 6

Jugador B: mu = 27, sigma = 2
PSR = 27 - 6 = 21
```

Aunque A tiene mayor media estimada, B esta mejor posicionado publicamente
porque hay mas certeza sobre su nivel.

## 3. Evento rankeable

Un evento `E` contiene:

```text
E = {
  sourceType,
  sourceId,
  seasonId,
  tournamentType,
  occurredAt,
  verified,
  entries[]
}
```

Cada entrada de jugador contiene:

```text
entry_i = {
  playerId,
  placement,
  totalTeams,
  kills,
  deaths,
  teamKills,
  skillPoints,
  averagePlacement,
  averageKills,
  roundsPlayed
}
```

## 4. Senal principal: placement

La senal principal es el orden competitivo:

```text
placement_score_i = (totalTeams - placement_i) / (totalTeams - 1)
```

Con truncamiento entre 0 y 1.

Si hay informacion por mapas, PSR combina placement final y placement promedio:

```text
placement_signal_i =
  0.72 * final_placement_score_i
  + 0.28 * average_placement_score_i
```

La logica es que el resultado final manda, pero la consistencia por mapa ayuda a
explicar el desempeno.

## 5. Senal de kills normalizada

Kills se normaliza por rondas para evitar premiar torneos mas largos:

```text
average_kills_i = kills_i / roundsPlayed_i
```

Luego se aplican retornos decrecientes:

```text
kills_signal_i =
  log(1 + average_kills_i) / log(1 + max_average_kills_event)
```

Esto evita que una diferencia extrema de kills domine el modelo.

## 6. Senal de equipo / skill points

Los archivos historicos `00_old` usaban una formula operacional:

```text
skillPoints_round = teamKills_round * placementMultiplier(placement_round)
```

Con:

```text
placementMultiplier(0)     = 0
placementMultiplier(1)     = 1.6
placementMultiplier(2..5)  = 1.4
placementMultiplier(6..10) = 1.2
placementMultiplier(11+)   = 1.0
```

PSR usa `skillPoints` como senal acotada, no como ranking final:

```text
team_signal_i = skillPoints_i / max_skillPoints_event
```

## 7. Senal compuesta de performance

La performance individual acotada es:

```text
performance_i =
  0.70 * placement_signal_i
  + 0.20 * kills_signal_i
  + 0.10 * team_signal_i
```

Esta senal no sustituye al resultado competitivo. Solo ajusta parcialmente el
movimiento de `mu` para distinguir desempenos dentro del mismo placement o
explicar contribucion individual.

## 8. Comparaciones por pares

En eventos con varios participantes, PSR compara pares ordenados por placement.
Si `w` queda arriba de `l`, se calcula:

```text
c = sqrt(2 * beta^2 + sigma_w^2 + sigma_l^2)
t = (mu_w - mu_l) / c
v = N(t) / Phi(t)
w_term = v * (v + t)
```

Donde:

- `N(t)` es la densidad normal estandar.
- `Phi(t)` es la acumulada normal estandar.
- `beta` representa ruido de performance.

El ganador recibe ajuste positivo y el perdedor ajuste negativo, escalado por
la incertidumbre y por el peso del resultado.

## 9. Ajuste por performance

Despues de las comparaciones, el sistema calcula si un jugador estuvo por
encima o por debajo de la performance media del evento:

```text
performanceAdjustment_i =
  clamp((performance_i - mean_performance_event) * maxMuAdjustment)
```

Este ajuste esta acotado. Sirve para reflejar kills, consistencia y puntos de
equipo, pero no permite que estadisticas secundarias anulen el placement.

## 10. Reduccion de incertidumbre

Cada evento verificado reduce `sigma` porque aporta informacion:

```text
sigma_next = sigma_dynamics * sqrt(max(sigmaShrinkFloor, 1 - shrink_i))
```

Ademas existe un piso `minSigma` para evitar falsa certeza. Ningun sistema debe
decir que conoce perfectamente la habilidad real.

## 11. Inactividad

Si un jugador deja de competir, la incertidumbre aumenta gradualmente:

```text
sigma = sigma + monthsInactive * sigmaIncreasePerMonth
```

Esto no castiga moralmente al jugador; reconoce que el estado competitivo puede
cambiar con el tiempo.

## 12. Matchpoint y el problema del 999

En datos historicos, el bonus de Matchpoint podia llevar el total bruto a `999`.
PSR lo separa:

```text
skillPoints = puntos competitivos sin bonus artificial
rawPoints = total historico bruto
matchpointBonus = rawPoints - skillPoints
matchpointWin = true/false
```

El `999` no entra como performance numerica porque distorsionaria el modelo. Se
guarda para auditoria y para explicar el evento, no para inflar habilidad.
