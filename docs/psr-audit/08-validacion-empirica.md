# Plan de Validacion Empirica

## 1. Objetivo

Validar que PSR no solo sea teoricamente razonable, sino empiricamente util
para Phoenix Arena.

## 2. Preguntas de validacion

- El ranking predice resultados futuros mejor que el score viejo?
- El top 10 es estable semana a semana?
- Los jugadores nuevos salen de calibracion en un tiempo razonable?
- Un solo evento extremo mueve demasiado el ranking?
- Hay sesgo por region, modalidad o tipo de torneo?
- El modelo responde bien a inactividad?
- Los admins pueden explicar cambios de rating en disputas?

## 3. Metricas recomendadas

### Predictividad

Medir si jugadores con mayor PSR tienden a superar a jugadores con menor PSR.

```text
accuracy_pairwise = comparaciones_correctas / comparaciones_totales
```

### Estabilidad

Medir cambio semanal del top:

```text
top_k_overlap = jugadores_en_ambas_listas / k
```

### Sensibilidad a outliers

Simular un evento extremo y medir:

```text
delta_max_por_evento
```

### Calibracion

Observar cuantos eventos requiere un jugador para reducir sigma:

```text
eventos_hasta_sigma < umbral
```

### Sesgo por fuente

Comparar deltas promedio por:

- `sourceType`,
- `tournamentType`,
- region,
- modalidad,
- verificacion.

## 4. Backtesting con `00_old`

Pipeline recomendado:

1. parsear archivos historicos,
2. normalizar aliases,
3. separar eventos validos, sospechosos y excluidos,
4. importar como `sourceType = legacy_excel`,
5. marcar `verified = false` al inicio,
6. correr PSR en modo shadow,
7. comparar contra resultados posteriores.

## 5. Criterios minimos para produccion monetizada

PSR deberia pasar:

- al menos 4 a 8 semanas de shadow mode,
- revision manual de outliers,
- auditoria de top movers,
- reporte de sensibilidad,
- documentacion publica de metodologia,
- flujo formal de disputa.

## 6. Salidas esperadas

Despues de suficiente data, se espera:

- ranking estable,
- tiers mas coherentes,
- menor volatilidad para jugadores con historial,
- mejor deteccion de talento nuevo sin sobrepublicarlo,
- mejor explicacion ante usuarios,
- base para matchmaking y torneos segmentados.
