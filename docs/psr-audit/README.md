# Auditoria del Modelo Phoenix Skill Rating (PSR)

Version del expediente: `psr-audit-0.1`
Modelo auditado: `psr-0.1-draft`
Esquema de captura: `psr-legacy-v1`

## Proposito

Esta carpeta documenta el fundamento teorico, matematico, operativo y
auditable del Phoenix Skill Rating (PSR), el modelo de clasificacion de
habilidad usado por Phoenix Arena.

El objetivo no es solo explicar "como se ordena una tabla", sino dejar una
base defendible para un producto competitivo donde los resultados pueden
afectar acceso a torneos, prestigio competitivo y dinero.

## Preguntas que responde

- Que problema resuelve PSR?
- En que modelos publicados se inspira?
- Por que un modelo bayesiano conservador es apropiado para esta plataforma?
- Como se relacionan habilidad, incertidumbre, performance, lobby y evidencia?
- Que datos alimentan el modelo?
- Como se audita cada cambio de ranking?
- Como evoluciona el puntaje de un jugador con el tiempo?
- Que ventajas, limitaciones y riesgos metodologicos tiene?
- Como se conecta el modelo con la web app y la base de datos?
- Como se importo el historico real de `00_old` hacia PSR?

## Mapa del expediente

1. [Resumen ejecutivo](./00-resumen-ejecutivo.md)
2. [Marco teorico](./01-marco-teorico.md)
3. [Metodologia matematica del PSR](./02-metodologia-matematica.md)
4. [Base de parametros y captura de datos](./03-parametros-y-datos.md)
5. [Arquitectura web y trazabilidad](./04-arquitectura-web-app.md)
6. [Auditoria, gobernanza y reproducibilidad](./05-auditoria-gobernanza.md)
7. [Ejemplos de evolucion del puntaje](./06-ejemplos-evolucion.md)
8. [Ventajas, limitaciones y riesgos](./07-ventajas-limitaciones.md)
9. [Plan de validacion empirica](./08-validacion-empirica.md)
10. [Referencias en formato Vancouver](./09-referencias-vancouver.md)
11. [Importacion historica desde 00_old](./10-importacion-historica-00-old.md)

## Ubicacion del modelo en el codigo

- Motor PSR: `src/lib/scoring/psr.ts`
- Reconstruccion y persistencia: `src/lib/ranking/psr-service.ts`
- Historial por jugador: `src/lib/ranking/player-history.ts`
- Graficas de historial: `src/components/player-psr-history.tsx`
- API publica de ranking: `src/app/api/ranking/route.ts`
- Captura admin de torneos: `src/app/api/admin/tournaments/[id]/results/route.ts`
- Esquema de datos: `prisma/schema.prisma`
- Migracion de captura legacy: `prisma/migrations/20260508000000_add_legacy_tournament_capture/migration.sql`
- Extractor historico: `scripts/extract_legacy_psr.py`
- Seed historico: `prisma/seed-legacy-psr.ts`
- Staging historico: `data/legacy-psr/legacy-import.json`

## Posicion metodologica central

PSR no es una suma simple de puntos. PSR estima una habilidad latente con
incertidumbre:

```text
habilidad_i ~ Normal(mu_i, sigma_i^2)
PSR_i = mu_i - 3 * sigma_i
```

Esto obliga a que un jugador no solo tenga buenos resultados, sino evidencia
repetida y verificable. La incertidumbre castiga muestras pequenas y ayuda a
evitar inflar jugadores por una sola partida extrema.

## Estado actual

El modelo esta implementado en modo operativo, pero la recomendacion formal es
mantenerlo en monitoreo hasta completar validacion empirica con datos reales:

- backtesting con historico,
- estabilidad semanal del top,
- sensibilidad a outliers,
- correlacion con resultados futuros,
- revision de sesgos por torneo, region, modalidad y calidad de evidencia.
