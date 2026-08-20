# CAT-004 — Proveedores

## Objetivo

Mantener proveedores comerciales opcionales para explicar a quién se pagó una compra o gasto.

## Criterios de aceptación

1. Una persona autorizada puede crear, consultar, activar y desactivar proveedores.
2. Un proveedor faltante puede crearse dentro de `FIN-001` sin perder la captura y queda seleccionado.
3. Desactivar un proveedor no altera gastos anteriores.
4. Los egresos pueden filtrarse y agruparse por proveedor en Insights.

## Fuera de alcance

- Cuentas por pagar, contratos, contactos y evaluación de proveedores.

## Done when

- `FIN-001` conserva el proveedor opcional y `REP-002` lo presenta como dimensión.
