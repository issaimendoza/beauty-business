# FIN-001 — Registrar gasto o compra

## Objetivo

Registrar cada salida de dinero para conocer cuánto se gasta y por qué.

## Historia

Como Andrea, quiero registrar una compra o gasto al ocurrir para construir una vista confiable del dinero que sale del negocio.

## Tipos iniciales

- Compra de producto o insumo.
- Gasto operativo.

## Datos

- Fecha.
- Tipo.
- Categoría.
- Concepto.
- Monto total.
- Producto, cantidad, unidad y costo unitario cuando aplique.
- Proveedor opcional.
- Método de pago.
- Referencia, folio o enlace de comprobante opcional; la carga de archivos queda fuera de alcance.
- Observaciones opcionales.

## Criterios de aceptación

1. Andrea puede registrar una compra o un gasto operativo.
2. Todo registro tiene fecha, concepto, categoría, monto positivo y método de pago.
3. Una compra puede incluir producto, cantidad, unidad, costo unitario y proveedor.
4. El monto usa una representación monetaria segura.
5. Andrea puede crear un producto, proveedor o categoría faltante sin perder la captura.
6. Desactivar catálogos no afecta gastos anteriores.
7. El registro queda disponible para totales por periodo y categoría.
8. Todo registro requiere una categoría activa; producto es obligatorio cuando el tipo es compra.
9. Producto, proveedor y categoría pueden crearse de forma contextual y quedan seleccionados sin reiniciar el formulario.
10. Productos, proveedores y categorías pueden desactivarse sin romper referencias históricas.

## Fuera de alcance

- Contabilidad de doble partida.
- Cuentas por pagar.
- Impuestos y facturación.
- Inventario perpetuo.
- Prorrateo automático por servicio.

## Done when

- Se puede reconstruir cuánto dinero salió en un periodo y agruparlo por categoría.
- Las validaciones y persistencia tienen pruebas.
- El flujo puede usarse desde móvil con pocos pasos.
