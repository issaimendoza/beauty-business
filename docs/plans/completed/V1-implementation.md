# V1 — Implementación integral

## Goal

Entregar una primera versión funcional de Beauty Business que cubra las fundaciones y las funcionalidades FND-001, FND-002, CAT-001, CAT-002, CAT-003, CAT-004, CAT-005, OPS-001, FIN-001, OPS-002, OPS-003, REP-001 y REP-002.

## Context

El alcance funcional, de dominio, arquitectura, diseño y seguridad está definido en `docs/` y fue aprobado para ejecución integral el 19 de agosto de 2026. La aplicación será pública en Internet, pero todo el contenido de negocio estará protegido por un acceso básico para dos personas, sin registro público.

## Constraints

- Aplicar arquitectura hexagonal y dependencias dirigidas hacia el dominio.
- Ejecutar la aplicación en el host y sus dependencias de desarrollo mediante Docker Compose.
- Usar PostgreSQL, Drizzle ORM, migraciones versionadas y datos seed seguros.
- Usar componentes basados en shadcn/ui, iconos Lucide, tema claro con rosa como color principal, animaciones discretas y estados accesibles.
- Mantener importes monetarios en unidades menores enteras.
- Proteger páginas, acciones y endpoints del servidor con autorización predeterminada denegada.
- No ampliar reglas de negocio que permanezcan fuera de alcance en las especificaciones.

## Execution phases

1. FND-001: estructura, configuración, PostgreSQL en Docker, Drizzle, migraciones, seed, pruebas y shell visual.
2. FND-002: autenticación, aprovisionamiento de dos usuarios, sesiones revocables, protección y limitación de intentos.
3. CAT-001 y CAT-002: colaboradoras y servicios, búsqueda remota, cursor y alta contextual.
4. OPS-001: registro de visitas, múltiples servicios, sugerencias, ajustes justificados y snapshots históricos.
5. FIN-001, CAT-003, CAT-004, CAT-005 y OPS-002: egresos, productos, proveedores comerciales, categorías y oportunidades perdidas.
6. OPS-003: cierre diario y conciliación de efectivo.
7. REP-001 y REP-002: resumen e Insights con filtros, comparación, gráficas, tablas y desglose trazable.
8. Verificación integral, sincronización documental y cierre del plan.

## Domain changes

- Incorporar entidades y value objects para colaboradoras, acuerdos, servicios, visitas, líneas de servicio, pagos, egresos, catálogos auxiliares, oportunidades perdidas y cierres diarios.
- Incorporar políticas puras para sugerencias de precio y reparto, ajustes justificados, totales y métricas.
- Preservar snapshots históricos de precios, acuerdos y nombres relevantes.

## Database changes

- Crear esquema relacional PostgreSQL y migraciones incrementales.
- Incluir índices para búsquedas, paginación keyset, filtros temporales y reportes.
- Proveer seed idempotente para usuarios y catálogos iniciales sin credenciales en texto plano.

## Application changes

- Crear casos de uso y puertos por funcionalidad.
- Implementar repositorios Drizzle como adaptadores de infraestructura.
- Exponer adaptadores de entrega mediante Route Handlers y páginas del App Router.
- Normalizar errores y registrar contexto técnico únicamente en el servidor.

## UI changes

- Crear acceso, dashboard, catálogos, registro de servicio, egresos, oportunidades perdidas, cierre e Insights.
- Añadir navegación adaptable con espacios reservados para identidad futura.
- Añadir tooltips informativos, iconografía, feedback de carga, estados vacíos, errores interpretados y movimiento reducido cuando corresponda.

## Tests

- Unitarias para dominio y casos de uso.
- Integración para repositorios, migraciones, autenticación y endpoints críticos.
- Componentes para estados interactivos principales.
- End-to-end para acceso y recorridos críticos.
- Ejecutar lint, typecheck, test y build al finalizar cada bloque relevante.

## Documentation

- Mantener README, arquitectura, dominio, decisiones, backlog y especificaciones sincronizadas cuando la implementación concrete decisiones.
- Documentar comandos de Docker, migraciones, seed, pruebas y aprovisionamiento.

## Risks and open questions

- La zona horaria definitiva sigue abierta; se implementará como configuración requerida con `America/Mexico_City` como valor de desarrollo documentado, no como regla irreversible.
- El modelo definitivo para renta fija o acuerdos híbridos sigue fuera de alcance; la V1 soportará el reparto porcentual especificado y ajustes manuales justificados.
- Propinas, devoluciones, pagos parciales y edición de visitas cerradas permanecen fuera de alcance.

## Done when

- Todos los criterios de aceptación de las especificaciones incluidas están implementados.
- Las migraciones parten de una base vacía y el seed es repetible.
- Los recorridos críticos funcionan con autorización efectiva del servidor.
- Lint, typecheck, pruebas y build terminan correctamente.
- La documentación refleja la operación real y este plan se mueve a `completed/` con métricas.

## Agent-first metrics

| Métrica | Resultado |
|---|---|
| Intentos del agente | 1 ejecución integral |
| Intervenciones humanas | 0 desde la aprobación |
| Cambios manuales | 0 conocidos |
| Pruebas generadas | 19 pruebas en 7 archivos: 14 Vitest y 5 Playwright |
| Bugs en revisión | 0 abiertos; las inconsistencias encontradas durante la auto-revisión fueron corregidas antes del cierre |
| Plan aceptado | Sí, mediante instrucción de ejecutar todos los planes y features |
| Feature completada por agente | Sí: FND-001, FND-002, CAT-001 a CAT-005, OPS-001 a OPS-003, FIN-001, REP-001 y REP-002 |

## Resultado

- Siete migraciones incrementales (`0000` a `0006`) reconstruidas correctamente sobre PostgreSQL vacío.
- Seed de catálogos ejecutado dos veces sin duplicados.
- Acceso sin registro público, dos cuentas aprovisionables por CLI, Argon2id, sesiones revocables, throttling, retorno al destino y protección de páginas/API.
- Catálogos, visitas multiservicio, ajustes justificados, servicio temporal, egresos, oportunidades, cierre, Dashboard e Insights implementados de extremo a extremo.
- Insights calcula desde líneas y snapshots, combina dimensiones compatibles, conserva filtros/granularidad en URL y ofrece detalle keyset paginado.
- `db:check`, lint, typecheck, 14 pruebas Vitest, 5 E2E y build de producción completados correctamente.
