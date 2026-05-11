# Ventajas, Limitaciones y Riesgos

## Ventajas

### 1. Ranking conservador

El uso de `PSR = mu - 3*sigma` evita que jugadores con poca evidencia sean
publicados demasiado arriba.

### 2. Incertidumbre explicita

El modelo no solo pregunta "que tan bueno parece ser?", sino "que tan seguros
estamos?".

### 3. Adecuado para torneos multijugador

PSR procesa placements y comparaciones entre multiples jugadores, no solo
victoria/derrota binaria.

### 4. Performance acotada

Kills, skill points y average placement explican desempeno, pero no dominan el
resultado competitivo.

### 5. Auditable

Cada cambio queda trazado en `RankingDelta`, `RankingEventLog` y
`RankingSnapshot`.

### 6. Compatible con historico

Los parametros recuperados de `00_old` alimentan evidencia sin reemplazar el
modelo.

### 7. Mejor para dinero y disputas

Un sistema explicable y reconstruible es mas defendible que una suma opaca.

## Limitaciones

### 1. Parametros iniciales requieren calibracion

Los pesos actuales son razonables, pero deben validarse con datos reales.

### 2. Sensible a calidad de captura

Si placement, kills o equipos se capturan mal, el modelo procesara evidencia
incorrecta.

### 3. No mide todo

El modelo no observa comunicacion, liderazgo, rol tactico o presion psicologica
salvo que aparezcan indirectamente en resultados.

### 4. Puede ser complejo de explicar

La sofisticacion mejora justicia, pero requiere UI clara para evitar percepcion
de caja negra.

### 5. Datos historicos tienen ruido

Los archivos antiguos contienen placeholders, cambios de formato y bonuses
artificiales. Deben importarse con revision.

## Riesgos y mitigaciones

### Riesgo: stat padding

Un jugador podria buscar kills sin jugar objetivo.

Mitigacion:

- kills pesan 20%,
- placement pesa mas,
- logaritmo aplica retornos decrecientes.

### Riesgo: smurfing

Un jugador fuerte crea cuenta nueva.

Mitigacion:

- sigma alta mantiene PSR publico bajo al inicio,
- trust_score separado,
- verificacion de identidad y dispositivos en futuras fases.

### Riesgo: torneos faciles

Un jugador farmea eventos de baja dificultad.

Mitigacion:

- lobbyStrength,
- sourceType,
- tournamentType,
- pesos por tipo de evento en futuras versiones.

### Riesgo: captura manual incorrecta

Mitigacion:

- evidenceUrl,
- adminVerified,
- sourceHash,
- reconstruccion desde logs,
- revision de disputas.

### Riesgo: sesgo por modalidad

Algunas modalidades pueden favorecer roles o estilos.

Mitigacion:

- segmentar por `tournamentType`,
- backtesting por modalidad,
- percentiles por pool competitivo.
