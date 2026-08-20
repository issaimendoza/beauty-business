# Backlog de la V1

## Estado

La V1 fue implementada y verificada el 19 de agosto de 2026. La tabla conserva el orden de entrega como registro histórico; nuevas capacidades requieren una especificación y un plan posteriores.

## Orden de entrega

| Orden | ID | Funcionalidad | Estado | Resultado |
|---:|---|---|---|---|
| 0 | `FND-001` | Bootstrap mínimo | Completada | Arquitectura, PostgreSQL local, siete migraciones, seed y pruebas disponibles |
| 1 | `FND-002` | Acceso básico | Completada | Dos cuentas aprovisionables, sesión revocable y aplicación protegida |
| 2 | `CAT-001` | Personal y colaboradores | Completada | Prestadores, vigencias e historial de acuerdos |
| 3 | `CAT-002` | Servicios | Completada | CRUD, cursor keyset, búsqueda remota, autocomplete y alta contextual |
| 4 | `CAT-003`–`CAT-005` | Catálogos auxiliares | Completada | Productos, proveedores y categorías usados por gastos e Insights |
| 5 | `OPS-001` | Registrar visita y servicio | Completada | Captura multiservicio, sugerencias editables, motivos y snapshots |
| 6 | `FIN-001` | Registrar gasto o compra | Completada | Compras y gastos con categoría, producto, proveedor y comprobante referencial |
| 7 | `OPS-002` | Registrar oportunidad perdida | Completada | Demanda no concretada con horario, canal, clientela, origen y motivo |
| 8 | `OPS-003` | Cierre diario | Completada | Control de calidad y conciliación de efectivo derivada de eventos |
| 9 | `REP-001` | Resumen operativo básico | Completada | Dashboard con indicadores calculados desde snapshots |
| 10 | `REP-002` | Insights operativos | Completada | Periodos, comparación, dimensiones, gráficas, tablas y detalle paginado |

## Catálogos de apoyo

Se incorporaron dentro de `FIN-001`, no como CRUD aislados:

- `CAT-003` Productos e insumos.
- `CAT-004` Proveedores.
- `CAT-005` Categorías de gasto.

Sus altas contextuales conservan el formulario de gasto y sus bajas lógicas preservan referencias históricas.

## Milestone 1 — Primera vertical

```text
Andrea registra una visita
  ↓
selecciona colaborador y servicio
  ↓
captura $600 cobrados
  ↓
el sistema conserva

$600 venta bruta
$180 ingreso del salón
$420 monto de la colaboradora
demanda originada por el salón
70 minutos de servicio
```

La vertical incluye dominio, migración, repositorio, caso de uso, validación, UI y pruebas.

Los flujos se ejecutan detrás del acceso definido en `FND-002`; conocer una URL interna no permite omitir la autenticación.

## Milestone 2 — Qué entró, qué salió y qué se perdió

Debe ser posible reconstruir un periodo con:

- actividad e ingreso;
- gastos y compras;
- oportunidades no concretadas.

## Milestone 3 — Línea base útil

Tras 30 días de adopción, el resumen debe mostrar visitas, servicios, ventas, ingreso real, reparto, ticket promedio, mix de servicios, duraciones, gastos y demanda perdida. `REP-002` convierte esa base en una sección de Insights con gráficas, comparación y detalle.

## Reglas de priorización

- No comenzar por dashboards sofisticados.
- No crear catálogos sin uso operativo próximo.
- No ampliar el alcance durante una implementación.
- Resolver primero el camino completo de una vertical.
- Cada feature compleja requiere un plan aprobado.
- Las preguntas de dominio bloqueantes regresan al propietario del producto; no se inventan.
