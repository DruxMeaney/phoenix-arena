# Auditoria del Modelo Phoenix Skill Rating (PSR)

Version del expediente: `psr-audit-0.2`
Modelo auditado: `psr-0.1-draft`
Esquema de captura: `psr-legacy-v1`
Fecha de actualizacion: `2026-05-11`
Commit de referencia productiva: `5983d1a`

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
- Cual es el estado productivo actual del ranking y del deploy?
- Que controles existen para torneos con pagos, premios y reembolsos?

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
12. [Estado actual de base, ranking y deploy](./11-estado-actual-base-y-deploy.md)
13. [Auditoria operativa de pagos y premios](./12-auditoria-operativa-pagos.md)

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
- Pagos PayPal: `src/lib/paypal.ts`
- Pagos MercadoPago: `src/lib/mercadopago.ts`
- Premios y splits: `src/lib/prize-splits.ts`
- Wallet/transacciones: `src/app/api/wallet/route.ts`

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

## Estado actual verificado

Produccion esta desplegada en Vercel desde la rama `main` y el ranking publico
lee snapshots persistidos. Estado observado el `2026-05-11`:

- URL publica: `https://phoenix-arena.vercel.app`
- rama productiva Vercel: `main`
- estado del deploy: `READY`
- jugadores en ranking: `2,846`
- jugadores elegibles: `501`
- eventos PSR persistidos: `155`
- deltas auditables: `8,272`
- hash de configuracion: `e6e1a57d30a5d0702e91dbff521a47fd4642d1668cdcb8da43e230cf09817a80`

El modelo ya opera con base historica real importada desde `00_old`, pero la
recomendacion formal sigue siendo mantener PSR como `shadow/monitoreo` antes de
usarlo como criterio final de premios, acceso monetizado o resolucion automatica
de disputas. La razon no es tecnica de implementacion, sino de validacion:
faltan backtests longitudinales, revision de outliers, sensibilidad por tipo de
torneo y calibracion de pesos con datos nuevos capturados por la app.
