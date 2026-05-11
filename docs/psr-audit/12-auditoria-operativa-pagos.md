# Auditoria Operativa de Pagos y Premios

Fecha de corte: `2026-05-11`
Estado: flujos implementados en codigo, PayPal en `sandbox`

## 1. Alcance

Este documento no certifica cumplimiento legal o financiero. Su objetivo es
describir, desde auditoria tecnica, como la web app mueve saldos internos,
inscripciones, reembolsos y premios, y que controles faltan antes de operar con
dinero real.

PSR y pagos son subsistemas separados:

```text
PSR = habilidad competitiva, ranking, historial, deltas
Pagos = wallet, transacciones, entradas, premios, reembolsos
```

Se conectan por el torneo, pero ninguno debe editar directamente la verdad del
otro sin dejar registros.

## 2. Proveedores y estado actual

### PayPal

Archivos:

```text
src/lib/paypal.ts
src/app/api/paypal/create-order/route.ts
src/app/api/paypal/capture-order/route.ts
src/app/api/paypal/webhook/route.ts
src/app/api/tournaments/[id]/paypal-join/route.ts
```

Estado:

- configurado en Vercel con `PAYPAL_MODE=sandbox`;
- credenciales sandbox validadas por OAuth;
- ordenes creadas server-side;
- captura server-side;
- webhook con verificacion de firma via PayPal;
- `custom_id` codifica `userId` y monto en centavos para identificar al payer.

### MercadoPago

Archivos:

```text
src/lib/mercadopago.ts
src/app/api/mercadopago/create-preference/route.ts
src/app/api/mercadopago/capture-payment/route.ts
src/app/api/mercadopago/webhook/route.ts
src/app/api/tournaments/[id]/mercadopago-join/route.ts
```

Estado:

- cliente REST implementado;
- conversion USD -> MXN con `MXN_PER_USD`;
- `external_reference` codifica tipo, usuario, monto y torneo;
- webhook con HMAC y tolerancia temporal;
- opcion principal de UI oculta por ahora.

## 3. Modelo de datos financiero

```text
Wallet(id, userId, balance, heldBalance)
Transaction(id, walletId, type, amount, description, status, reference)
Tournament(entryFee, prizePool, prizeDistribution, customPrizeSplits)
TournamentEntry(paidAmount, discountAmount)
TournamentResult(placement, adminVerified, sourceHash)
```

Tipos de transaccion observados en codigo:

```text
deposit
tournament_entry
tournament_refund
tournament_win
withdrawal
commission
```

## 4. Flujo de deposito PayPal

```text
usuario autenticado
  -> POST /api/paypal/create-order
  -> PayPal approval
  -> POST /api/paypal/capture-order
  -> Wallet.balance incrementa
  -> Transaction(type=deposit, reference=orderId)
```

Webhook:

```text
PAYMENT.CAPTURE.COMPLETED
  -> verificar firma
  -> reconsultar captura
  -> decodificar custom_id
  -> si no existe Transaction(reference=orderId,type=deposit)
     -> acreditar wallet
```

Control principal: idempotencia por `Transaction.reference`.

## 5. Flujo "fund + join"

Cuando un usuario no tiene saldo suficiente para un torneo:

```text
pre-check torneo
  -> captura proveedor
  -> Tx A: acreditar deposito
  -> Tx B: descontar entryFee, crear TournamentEntry, incrementar prizePool
```

Si `Tx B` falla despues de acreditar el deposito, el saldo queda en la wallet.
Esto es una decision correcta: el usuario no queda fuera de dinero aunque la
inscripcion no se concrete.

## 6. Reembolsos

### Salida voluntaria

`POST /api/tournaments/[id]/leave`:

- permitido solo en `registration`;
- devuelve `paidAmount` o `entryFee`;
- elimina `TournamentEntry`;
- decrementa `filledSlots` y `prizePool`.

### Cancelacion admin

`POST /api/admin/tournaments/[id]/cancel`:

- bloquea torneos `finished`;
- itera entradas;
- reembolsa saldos;
- crea `Transaction(type=tournament_refund)`;
- marca `status=cancelled`;
- pone `prizePool=0`.

## 7. Premios

Al capturar resultados admin:

```text
POST /api/admin/tournaments/[id]/results
  -> TournamentResult
  -> RankingMatchRecord
  -> rebuild PSR
  -> premios si torneo no estaba finished y prizePool > 0
```

Reglas:

```text
PLATFORM_COMMISSION = 0.1
winner_takes_all = [100]
top_3 = [60, 25, 15]
top_5 = [40, 25, 15, 12, 8]
top_8 = [40, 22, 13, 8, 7, 5, 3, 2]
custom = JSON array que debe sumar 100
```

El pool distribuible es:

```text
distributablePool = prizePool * (1 - PLATFORM_COMMISSION)
```

Los premios se pagan como:

```text
Transaction(type=tournament_win, amount=prize, reference=tournament.id)
```

## 8. Controles positivos actuales

- Los pagos se verifican server-side.
- Los webhooks validan firmas.
- Las referencias externas permiten idempotencia.
- Los flujos "fund + join" no mantienen locks de DB durante llamadas externas.
- Los reembolsos y premios dejan `Transaction`.
- Los premios se pagan dentro de transaccion y solo si el torneo no estaba ya
  `finished`, reduciendo riesgo de doble pago por reenvio de resultados.
- El dev login no esta visible en produccion.

## 9. Riesgos y acciones recomendadas

### Riesgo 1: endpoint de deposito manual

`POST /api/wallet` permite `action=deposit` y acredita saldo directamente. Esto
sirve para desarrollo, pero no debe estar disponible para dinero real.

Accion:

```text
bloquear deposit manual en NODE_ENV=production
o exigir rol admin + motivo + referencia interna
```

### Riesgo 2: inscripcion wallet-only no atomica

`POST /api/tournaments/[id]/join` descuenta wallet, crea transaccion, crea entry
y actualiza torneo en pasos separados.

Accion:

```text
envolver todo en prisma.$transaction
releer torneo dentro de la transaccion
validar status, slots y duplicados dentro de la transaccion
```

### Riesgo 3: idempotencia sin restriccion unica

El codigo busca transacciones existentes por `reference` y `type`, pero el schema
no declara una restriccion unica.

Accion:

```text
agregar unique index logico:
Transaction(type, reference)
cuando reference no sea null
```

SQLite requiere cuidado para partial indexes; si no se implementa a nivel DB,
debe existir un ledger separado.

### Riesgo 4: credenciales compartidas

Las credenciales sandbox fueron compartidas por chat. Aunque no sean live, deben
rotarse antes de pasar a produccion real.

Accion:

```text
rotar PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET antes de live
crear PAYPAL_WEBHOOK_ID productivo
separar sandbox/live por entorno
```

### Riesgo 5: conciliacion inexistente

No hay job periodico que compare `Transaction` contra reportes PayPal o
MercadoPago.

Accion:

```text
crear conciliacion diaria:
proveedor -> lista de capturas/pagos
DB -> Transaction(reference,type=deposit)
reporte -> faltantes, duplicados, montos divergentes
```

### Riesgo 6: retiro manual/procesamiento

Los retiros quedan como `processing`, pero no hay flujo de aprobacion,
transferencia externa o cierre.

Accion:

```text
WithdrawalRequest(id, userId, amount, commission, status, reviewedBy, providerRef)
```

## 10. Matriz minima de pruebas antes de live

```text
PayPal wallet top-up aprobado -> 1 deposit tx
PayPal webhook duplicado -> no duplica saldo
PayPal fund+join aprobado -> deposit + tournament_entry + prizePool
PayPal fund+join con torneo lleno despues de deposito -> saldo queda en wallet
MercadoPago wallet top-up aprobado -> 1 deposit tx
MercadoPago webhook con firma invalida -> 400 sin saldo
Wallet-only join concurrente -> una sola entry, prizePool correcto
Leave tournament -> refund exacto
Cancel tournament -> reembolsa todas las entries
Submit results dos veces -> no doble premio
Withdrawal -> balance baja, commission registrada, status processing
```

## 11. Relacion con PSR

El cierre de resultados de torneo dispara dos consecuencias:

```text
resultado verificado -> PSR rebuild
resultado final + prizePool -> distribucion de premios
```

Ambas deben ser auditables, pero no son lo mismo. Si un resultado se corrige:

1. Se debe reconstruir PSR.
2. Se debe evaluar si hubo pago de premios.
3. Si hubo premio, cualquier ajuste financiero debe registrarse como nueva
   transaccion o disputa, no borrando el historial anterior.

Esta regla protege trazabilidad y evita que una correccion tecnica o deportiva
reescriba silenciosamente movimientos de dinero.
