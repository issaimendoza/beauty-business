# CAT-005 — Categorías de gasto

## Objetivo

Clasificar cada egreso con un catálogo pequeño y administrable.

## Criterios de aceptación

1. Una persona autorizada puede crear, consultar, activar y desactivar categorías.
2. Todo gasto o compra requiere una categoría.
3. Una categoría faltante puede crearse dentro de `FIN-001` sin perder la captura y queda seleccionada.
4. Desactivar una categoría impide usarla en nuevas capturas sin alterar registros históricos.
5. El seed inicial es idempotente y no duplica nombres normalizados.

## Done when

- Los egresos se reconstruyen y agrupan por categoría para cualquier periodo.
