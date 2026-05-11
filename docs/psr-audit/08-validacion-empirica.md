# Plan de Validacion Empirica

Estado de base observado el `2026-05-11`:

```text
jugadores en ranking = 2846
jugadores elegibles = 501
jugadores en calibracion = 2345
jugadores con decay activo = 2822
eventos PSR persistidos = 155
deltas auditables = 8272
```

Distribucion PSR observada:

```text
min = -9.1
p25 = -2.3
mediana = -0.5
p75 = 1.9
max = 28.6
```

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

Base disponible para backtesting:

```text
156 eventos extraidos
155 eventos rankeables
8337 participaciones historicas
2843 jugadores legacy normalizados
```

Diseño recomendado:

1. Ordenar eventos por fecha inferida.
2. Entrenar PSR con los primeros `70%` de eventos.
3. Evaluar prediccion pairwise y top-k en el `30%` final.
4. Repetir por tipo de torneo: `all_skills`, `only_detri`, `scrim`,
   `pro_am_detri`, `community`, `legacy_custom`.
5. Comparar contra dos baselines:
   - puntos legacy acumulados,
   - ranking por placement promedio.
6. Reportar si PSR predice mejor sin aumentar volatilidad injustificada.

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

## 7. Criterios numericos de aceptacion propuestos

Para defender el modelo ante socios, jugadores y operadores, se recomiendan
umbrales iniciales:

```text
top_10_weekly_overlap >= 0.70
top_50_weekly_overlap >= 0.80
pairwise_prediction_accuracy > baseline_legacy + 5 puntos porcentuales
max_single_event_delta_p95 <= umbral definido por comite
calibration_exit_rate_4_events >= 80%
manual_audit_top_movers = 100% revisado semanalmente
```

Estos valores no son leyes matematicas; son metas de control para saber si el
modelo se comporta con suficiente estabilidad antes de usarlo en decisiones con
dinero.

## 8. Validacion financiera paralela

Como la app ahora contiene pagos, la validacion empirica de PSR debe correr en
paralelo con una validacion financiera:

- deposito aprobado por proveedor produce exactamente una transaccion;
- webhooks duplicados no duplican saldo;
- inscripcion incrementa `filledSlots` y `prizePool` una sola vez;
- salida o cancelacion reembolsa exactamente lo cobrado;
- cierre de torneo paga premios una sola vez;
- comision de plataforma y comision de retiro son visibles en historial;
- cada movimiento puede conciliarse contra `Transaction.reference`.

El ranking puede pasar pruebas estadisticas y aun asi no estar listo para dinero
real si el ledger no pasa estas pruebas.
