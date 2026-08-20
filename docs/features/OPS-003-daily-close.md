# OPS-003 — Cierre diario

## Objetivo

Confirmar que la captura individual representa lo ocurrido y detectar omisiones o diferencias de caja.

## Historia

Como Andrea, quiero revisar un cierre breve al terminar el día para identificar ventas o gastos faltantes sin volver a capturar todos los totales.

## Datos mostrados por el sistema

- Venta bruta registrada.
- Ingreso del salón registrado.
- Efectivo esperado.
- Transferencias registradas.
- Pagos con tarjeta registrados.
- Gastos registrados.

## Datos capturados

- Efectivo físico en caja.
- Confirmación de ventas no registradas.
- Confirmación de gastos no registrados.
- Observaciones opcionales.

## Criterios de aceptación

1. El cierre usa como fuente los eventos del día.
2. Andrea no vuelve a escribir totales que el sistema ya conoce.
3. El sistema muestra diferencias entre efectivo esperado y observado.
4. Si existen eventos faltantes, ofrece una ruta clara para registrarlos.
5. Guardar el cierre no modifica automáticamente visitas o gastos.
6. Puede identificarse si un día está pendiente, conciliado o tiene diferencias.

## Fuera de alcance

- Contabilidad formal.
- Arqueos por múltiples cajas.
- Depósitos bancarios.
- Liquidación de colaboradores.

## Momento de incorporación

Se incorporó en la V1 para que pueda usarse desde el primer día. Su valor analítico aumentará después de acumular operación, pero no requiere esperar para detectar omisiones o diferencias de efectivo.

## Done when

- El cierre permite detectar diferencias sin sustituir la captura individual.
- Las fórmulas y estados tienen pruebas.
- El flujo se completa en pocos pasos desde móvil.
