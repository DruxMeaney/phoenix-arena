# Marco Teorico

## 1. Problema general del ranking competitivo

Un sistema de ranking competitivo intenta estimar la habilidad relativa de
jugadores a partir de resultados observados. El problema es estadistico porque
la habilidad real no se observa directamente. Lo que se observa son resultados
parciales: victorias, derrotas, placement, kills, desempeno de equipo, calidad
del lobby y evidencia administrativa.

Un modelo robusto debe responder:

- que tan fuerte parece ser un jugador,
- que tanta incertidumbre hay en esa estimacion,
- que tan confiable es la evidencia,
- como cambia la estimacion despues de cada evento,
- si el cambio puede reproducirse desde cero.

## 2. Elo como punto historico de partida

El sistema Elo introdujo una idea poderosa: el cambio de rating debe depender
de la diferencia entre resultado esperado y resultado observado. Si un jugador
vence a un rival fuerte, gana mas rating que si vence a un rival debil. Si
pierde contra un rival debil, pierde mas rating.

Su estructura conceptual puede resumirse asi:

```text
rating_nuevo = rating_previo + K * (resultado_observado - resultado_esperado)
```

Esto es intuitivo, pero no basta para Phoenix Arena porque Elo clasico no
representa explicitamente la incertidumbre ni esta disenado para torneos
multijugador con placements y equipos.

## 3. Glicko y Glicko-2: incertidumbre y estabilidad

Glicko agrega una capa fundamental: no todos los ratings tienen la misma
precision. Un jugador con 100 partidas verificadas no debe tener la misma
incertidumbre que uno con 2 partidas. Por eso Glicko usa un rating deviation
`RD`, equivalente conceptual a una medida de incertidumbre.

Glicko-2 agrega volatilidad, que representa cambios esperados en la consistencia
del rendimiento. La idea importante para PSR es esta: un ranking profesional no
debe publicar solo "fuerza", tambien debe saber que tan seguro esta de esa
fuerza.

PSR adopta esa separacion mediante:

```text
mu    = habilidad estimada
sigma = incertidumbre
```

## 4. TrueSkill: habilidad latente bayesiana

TrueSkill modela la habilidad como una variable latente con distribucion normal:

```text
skill_i ~ Normal(mu_i, sigma_i^2)
```

Cada partida produce evidencia sobre esa habilidad. El sistema actualiza una
distribucion posterior usando el resultado observado. Esta perspectiva es
especialmente valiosa porque permite:

- representar incertidumbre,
- manejar jugadores nuevos,
- procesar equipos,
- trabajar con multiples participantes,
- publicar una estimacion conservadora.

PSR se inspira directamente en esta logica. No copia TrueSkill como caja negra;
adapta sus principios a los datos disponibles en Phoenix Arena.

## 5. Weng y Lin / OpenSkill: ranking online multijugador

Los modelos de Weng y Lin proponen aproximaciones bayesianas para ranking online
en juegos con multiples equipos y jugadores. OpenSkill populariza modelos
abiertos como Bradley-Terry, Thurstone-Mosteller y Plackett-Luce para escenarios
multijugador.

La importancia para Phoenix Arena es clara: muchos torneos no son 1 vs 1. Hay
placements, lobbies, equipos y resultados asimetricos. Por eso PSR procesa un
evento multijugador como un conjunto de comparaciones entre posiciones, al
estilo TrueSkill/OpenSkill, y usa performance acotada para explicar diferencias
sin permitir que kills o puntos brutos dominen el ranking.

## 6. Modelos de comparacion por pares

Bradley-Terry y Plackett-Luce son marcos estadisticos para estimar preferencias
o habilidad a partir de ordenamientos. La intuicion aplicada al ranking es:

- si A queda por encima de B, el evento aporta evidencia de que A tuvo mejor
  desempeno en ese contexto;
- si ese resultado ocurre contra muchos rivales fuertes, la evidencia es mayor;
- si el evento tiene poca muestra o baja calidad, la actualizacion debe ser
  limitada.

PSR usa esta filosofia al comparar placements dentro de un evento y ponderar el
ajuste por fuerza de lobby e incertidumbre.

## 7. Por que un modelo sofisticado es necesario

Cuando hay dinero, premios o acceso competitivo, un ranking simple genera
incentivos peligrosos:

- jugar eventos faciles para farmear puntos,
- inflar kills sin jugar al objetivo,
- explotar torneos con baja verificacion,
- crear cuentas nuevas para volatilidad alta,
- disputar resultados sin trazabilidad.

PSR reduce esos riesgos con:

- rating conservador,
- incertidumbre explicita,
- evidencia versionada,
- performance individual acotada,
- separacion entre habilidad y confianza,
- reconstruccion completa desde registros.
