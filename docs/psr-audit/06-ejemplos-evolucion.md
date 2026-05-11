# Ejemplos de Evolucion del Puntaje

Estos ejemplos son pedagogicos. No sustituyen el calculo exacto del motor, pero
ayudan a explicar como se construye el PSR con el tiempo.

## Ejemplo 1: jugador nuevo con gran primera partida

Estado inicial:

```text
mu = 25
sigma = 8.33
PSR = 25 - 3*8.33 = 0.01
```

Evento 1:

```text
placement = 1/12
kills = 14
skillPoints = alto
lobbyStrength = medio
```

El jugador gana `mu`, pero `sigma` sigue alta porque solo hay una muestra.

Resultado aproximado:

```text
mu = 26.8
sigma = 7.9
PSR = 26.8 - 23.7 = 3.1
```

Interpretacion:

El sistema reconoce buen desempeno, pero no lo pone automaticamente arriba del
ranking.

## Ejemplo 2: consistencia durante 8 eventos

Jugador con placements:

```text
3, 4, 2, 5, 3, 6, 2, 4
```

Kills promedio por mapa:

```text
3.1, 2.8, 3.5, 2.6, 3.2, 2.9, 3.7, 3.0
```

Efecto esperado:

- `mu` sube moderadamente,
- `sigma` baja,
- PSR sube de forma mas clara que `mu`,
- el jugador sale de calibracion.

La clave es la reduccion de incertidumbre:

```text
Evento 1: mu=26.0, sigma=7.9, PSR=2.3
Evento 4: mu=27.1, sigma=6.3, PSR=8.2
Evento 8: mu=28.0, sigma=4.8, PSR=13.6
```

## Ejemplo 3: high-kill inconsistente

Jugador:

```text
kills altas
placements: 10, 2, 11, 1, 12, 8
```

PSR no debe premiarlo solo por kills. La senal de kills tiene retornos
decrecientes y pesa 20%. El placement y la consistencia pesan mas.

Efecto esperado:

- sube cuando gana contra lobby fuerte,
- baja o se estanca cuando queda mal posicionado,
- mantiene sigma relativamente alta si su rendimiento es erratico.

## Ejemplo 4: jugador con Matchpoint 999

Datos historicos:

```text
skillPoints = 42
rawPoints = 999
matchpointBonus = 957
matchpointWin = true
placement = 1
```

PSR usa:

```text
placement = 1
skillPoints = 42
matchpointWin = true como metadata
```

No usa:

```text
rawPoints = 999 como performance
```

Interpretacion:

El jugador gano el evento y eso importa. Pero el bonus artificial no puede
inflar la habilidad estimada como si fuera 20 veces mejor que el resto.

## Ejemplo 5: inactividad

Jugador fuerte:

```text
mu = 34
sigma = 3
PSR = 25
```

Despues de meses sin competir, la habilidad real puede haber cambiado. PSR no
baja `mu` directamente; aumenta incertidumbre:

```text
mu = 34
sigma = 4
PSR = 22
```

Interpretacion:

El sistema no afirma que el jugador empeoro. Solo publica una estimacion mas
prudente hasta tener nueva evidencia.

## Ejemplo 6: lobby fuerte vs lobby debil

Dos jugadores ganan dos eventos distintos:

```text
Jugador A gana contra top 20.
Jugador B gana contra jugadores en calibracion.
```

Aunque ambos tengan placement 1, el lobby de A aporta mas evidencia. PSR debe
mover mas a A que a B, porque vencer a rivales fuertes reduce mas incertidumbre
sobre habilidad alta.
