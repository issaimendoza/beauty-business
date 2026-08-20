# CAT-003 — Productos e insumos

## Objetivo

Mantener las referencias de productos usadas al registrar compras sin introducir inventario.

## Criterios de aceptación

1. Una persona autorizada puede crear, consultar, activar y desactivar productos.
2. Un producto faltante puede crearse dentro de `FIN-001` sin perder la captura y queda seleccionado.
3. Los productos inactivos no aparecen en nuevas compras y permanecen vinculados a registros históricos.
4. El nombre normalizado evita duplicados equivalentes.

## Fuera de alcance

- Existencias, movimientos de almacén, lotes, caducidad y consumo por servicio.

## Done when

- `FIN-001` puede registrar y analizar compras por producto.
