# Adaptación del template hexagonal

## Fuente

Se revisaron `AGENTS.md`, las 21 reglas de `.cursor/rules/`, la configuración TypeScript/ESLint/Jest y la estructura real del template local `Supplynet/Template/hexagonal-architecture`.

Beauty Business conserva los principios, pero no copia mecanismos ligados a otra tecnología o escala.

## Matriz de adaptación

| Regla del template | Decisión | Adaptación en Beauty Business |
|---|---|---|
| Carga obligatoria de reglas | Adoptada | `AGENTS.md` obliga a descubrir y leer `.cursor/rules/` para cualquier agente |
| Límites de capas | Adoptada | Dependencias inward-only por módulo; composition root como excepción explícita |
| Arquitectura de servicios | Adaptada | Servicios genéricos se sustituyen por casos de uso nombrados e inyección por constructor |
| Arquitectura de repositorios | Adoptada/adaptada | Puerto en application, adapter Drizzle en infrastructure, sin Inversify ni repositorios CRUD universales |
| DTO/domain/infra entities | Adaptada | Zod Input → command → domain → persistence row; mappers solo cuando existe diferencia real |
| HTTP routes | Adaptada | Route Handlers y Server Actions del App Router como delivery adapters delgados |
| Convenciones y estabilidad de URL | Adoptada | Recursos `kebab-case`, parámetros claros y ninguna ruptura silenciosa |
| Middleware | Adaptada | Preocupación de delivery; usar mecanismos de Next solo cuando exista una necesidad transversal real |
| Catch/rethrow | Adoptada | `unknown`, normalización y preservación de `cause` |
| Logging | Adaptada | Eventos ricos, una sola falla registrada y prohibición estricta de PII/datos sensibles |
| Acceso centralizado a environment | Adoptada | Módulo tipado server-only con Zod; excepciones para configs raíz de Next/Drizzle |
| Pruebas de entidades | Ampliada | Se prueban todas las reglas de dominio y casos de uso, no solo entidades |
| Solo tests exigidos por reglas | Rechazada | Beauty Business exige pruebas para toda regla de negocio modificada y regresiones razonables |
| No nuevos errores lint | Adoptada | Sin supresiones para ocultar errores introducidos |
| Validación post-change | Ampliada | lint, typecheck, test y build cuando existan scripts |
| JSDoc exhaustivo | Simplificada | Documentar contratos y semántica no evidente, evitando comentarios ceremoniales |
| Etiquetas `@ai` | No adoptada | La intervención del agente se mide en planes y Git, no dentro del código fuente |
| Swagger obligatorio | Diferida | No existe API pública en V1; documentar un contrato HTTP cuando aparezca un consumidor real |
| Integration events/RabbitMQ | Diferida | Fuera de alcance; requieren decisión arquitectónica antes de introducirlos |
| `IConnection` payload wrappers | No aplicable | No existe ese port genérico; los inputs nominales sí se recomiendan para casos de uso |
| MongoDB/MSSQL/Redis adapters | No aplicable | Persistencia acordada: PostgreSQL con Drizzle |
| Inversify binders e identifiers | No adoptada inicialmente | Composición manual y fábricas explícitas hasta demostrar necesidad de un contenedor |

## Diferencias deliberadas

### Verticales modulares

El template organiza capas globales (`application`, `infrastructure`, `ui`). Beauty Business agrupa primero por módulo y mantiene capas dentro de cada módulo para reducir acoplamiento entre funcionalidades.

### Next.js es entrega, no arquitectura

Pages, Server Components, Server Actions y Route Handlers pertenecen al borde. El dominio y los casos de uso no saben que Next.js existe.

### Menos abstracción preventiva

No se copian clases base, serializadores, binders, buses de eventos o repositorios universales antes de necesitarlos. La regla hexagonal es separar dependencias, no maximizar la cantidad de interfaces.

### Estándar de pruebas más fuerte

El template limita pruebas nuevas a reglas que las exigen. En este proyecto, cada regla financiera, histórica o de reparto debe quedar protegida, porque los errores degradan los datos con los que se tomarán decisiones durante meses.

## Revisión futura

Revisar esta adaptación después de completar `OPS-001`. La primera vertical mostrará si la estructura de módulos, el composition root y los mappers propuestos son suficientes o demasiado pesados. Cualquier ajuste debe registrarse en `DECISIONS.md`.
