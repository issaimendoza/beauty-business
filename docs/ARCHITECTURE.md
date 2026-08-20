# Arquitectura

## Estado

Arquitectura implementada para la primera versión. Las capas, PostgreSQL, migraciones y módulos se encuentran bajo `src/` y `drizzle/`.

## Decisión principal

Construir un **monolito modular** con UI y backend en un solo proyecto y un solo despliegue.

```text
Next.js
  ├── React UI
  ├── Server Actions / Route Handlers
  ├── Application
  ├── Domain
  └── Infrastructure / Drizzle
             │
             ▼
        PostgreSQL
```

No se crearán inicialmente `beauty-client` y `beauty-core-api`. La separación lógica dentro del código permitirá extraer una API si aparecen clientes móviles, integraciones, webhooks, workers o una API pública.

## Stack acordado

- Node.js y TypeScript estricto.
- Next.js con React.
- PostgreSQL como sistema de registro.
- Drizzle ORM y Drizzle Kit.
- Zod para validación en límites de entrada.
- Tailwind CSS.
- shadcn/ui de forma incremental, solo para componentes necesarios.
- Vitest para reglas y casos de uso.
- Playwright para flujos críticos end-to-end.
- Docker para PostgreSQL local.
- Better Auth con adaptador Drizzle para autenticación y sesiones revocables; Argon2id para contraseñas.

Las versiones y APIs concretas deben verificarse en la documentación instalada antes de implementar.

## Ambiente de desarrollo

Las dependencias locales de infraestructura se ejecutan mediante Docker Compose. La aplicación Next.js no forma parte del stack de desarrollo y se ejecuta directamente en el host con npm.

```text
Host
└── Next.js (`npm run dev`)
      │
      ▼
Docker Compose
└── PostgreSQL
```

Si una funcionalidad futura requiere otra dependencia —por ejemplo un emulador de almacenamiento, correo o cola— se agrega al Compose únicamente cuando exista esa necesidad aprobada. No se añaden servicios preventivamente.

La política detallada está en `DEVELOPMENT_ENVIRONMENT.md`.

## Acceso y sesiones

La aplicación puede tener una URL pública, pero opera con **denegación por defecto**: `/login` es público y las páginas, Server Actions y Route Handlers de negocio requieren una sesión válida comprobada en el servidor.

```text
Internet
   │
   ▼
/login ── credenciales válidas ──► sesión segura
                                      │
                                      ▼
                              aplicación protegida
```

Reglas:

- dos cuentas individuales, ambas con acceso completo;
- no existe registro, recuperación, roles ni administración de usuarios en la V1;
- contraseñas almacenadas únicamente como hashes adaptativos con salt, preferentemente Argon2id;
- sesión revocable mediante una cookie `HttpOnly`, `Secure` en producción y `SameSite` explícito;
- tokens y sesiones nunca se guardan en Web Storage;
- HTTPS es obligatorio para cualquier publicación;
- cada operación protegida valida sesión del lado servidor; el middleware o una redirección visual no sustituyen esa validación;
- errores de login genéricos y throttling temporal para impedir enumeración y reducir fuerza bruta;
- credenciales aprovisionadas mediante un comando administrativo seguro (`auth:provision` interactivo o `db:bootstrap` desde un env gitignored), nunca mediante un seed con secretos versionados;
- no se implementa criptografía, hashing ni un protocolo de sesión propio si una librería mantenida cubre la necesidad.

El detalle funcional y las pruebas obligatorias están en `features/FND-002-basic-access.md`.

## Estructura implementada

```text
src/
├── app/
│   ├── (protected)/
│   ├── api/
│   └── login/
├── components/
│   └── ui/
├── modules/
│   ├── business/
│   │   ├── application/
│   │   └── infrastructure/
│   └── visits/
│       └── domain/
└── shared/
    ├── domain/
    ├── infrastructure/
    │   ├── auth/
    │   ├── composition/
    │   ├── config/
    │   └── database/
    └── presentation/

drizzle/                 # migraciones versionadas
scripts/                 # migración, seed, bootstrap y aprovisionamiento
tests/                   # dominio, aplicación, integración, componentes y E2E
netlify.toml             # cómo Netlify construye y publica Next.js
```

Cada módulo crece solo cuando existe comportamiento real:

```text
module/
├── domain/
├── application/
│   ├── port/
│   └── use-case/
├── infrastructure/
│   └── persistence/
└── ui/
```

No se crearán carpetas, interfaces o abstracciones vacías solo para imitar la estructura.

Las convenciones completas y comprobables están en `CODING_STANDARDS.md` y en `.cursor/rules/`.

La presentación, el sistema visual, los componentes shadcn/ui, la interacción, los estados asíncronos y los errores visibles se rigen por `DESIGN.md`.

La entrega usa `src/app/`; la migración desde el scaffold raíz se completó en `FND-001`.

## Flujo de dependencia

```text
UI
  ↓
Application use case
  ↓
Domain
  ↓
Repository port
  ↓
Drizzle adapter
  ↓
PostgreSQL
```

Reglas:

- El dominio no importa Next.js, Drizzle ni componentes de UI.
- La UI no inserta ni consulta directamente la base de datos.
- Los casos de uso coordinan reglas y puertos.
- Infraestructura implementa persistencia y servicios externos.
- Los handlers de Next.js son mecanismos de entrega, no el lugar del negocio.

## Persistencia

PostgreSQL fue elegido por las relaciones, integridad, históricos y necesidades analíticas del dominio.

JSONB puede conservar metadatos experimentales mientras se aprende, pero los conceptos ya entendidos —visita, servicio, colaborador, reparto y gasto— deben modelarse explícitamente.

La tabla implementada `visit_service` conserva:

```text
visit_service
├── id
├── visit_id
├── professional_id
├── service_id
├── service_name_snapshot
├── category_snapshot
├── professional_name_snapshot
├── list_price_minor_snapshot
├── duration_minutes_snapshot
├── suggested_price_minor
├── suggested_salon_minor
├── suggested_professional_minor
├── final_price_minor
├── final_salon_minor
├── final_professional_minor
├── agreement_kind_snapshot
├── salon_share_bps_snapshot
├── professional_share_bps_snapshot
├── price_adjustment_reason
├── split_adjustment_reason
├── started_at
├── completed_at
└── pending_catalog_completion
```

Las relaciones exactas, restricciones e índices están versionados en `src/shared/infrastructure/database/schema.ts` y `drizzle/`. Los importes finales y sugeridos, porcentajes, nombres, categoría y duración se conservan como snapshots.

## Dinero

- Usar unidades mínimas enteras o un tipo decimal de precisión explícita.
- Nunca usar `number` con operaciones de punto flotante para reglas monetarias.
- Centralizar cálculo, redondeo y moneda.
- Guardar resultados históricos además de los parámetros del acuerdo.

## Captura y experiencia

- El flujo frecuente se diseña para móvil y 20–40 segundos.
- La UI utiliza tokens semánticos y componentes basados en shadcn/ui conforme a `DESIGN.md`.
- Los catálogos deben ofrecer búsqueda y alta contextual mediante un modal pequeño.
- Los campos automáticos no se piden al usuario.
- Los valores predeterminados deben reducir toques sin ocultar información crítica.
- Un elemento nuevo queda seleccionado después de guardarse.

## Consulta de catálogos y autocomplete

El módulo `services` expone un caso de uso o query service de búsqueda paginada. La UI no consulta Drizzle ni descarga el catálogo completo para filtrarlo en memoria.

```text
Combobox / listado
      ↓
Query validada
      ↓
SearchServices
      ↓
Puerto de lectura
      ↓
Drizzle keyset query
      ↓
CursorPage<ServiceOption>
```

Reglas para `CAT-002`:

- paginación keyset, no `OFFSET`;
- orden estable por nombre normalizado más `id` como desempate;
- cursor opaco y validado que representa las claves necesarias para continuar y queda vinculado a la consulta normalizada mediante una huella o versión verificable;
- límite predeterminado 20 y máximo 50;
- filtros y búsqueda forman parte de la identidad de la consulta; al cambiar, el cursor se descarta;
- resultados acotados con `items`, `nextCursor` y `hasNextPage`;
- búsqueda y paginación se ejecutan en PostgreSQL mediante el adaptador;
- selección por `id`, nunca por nombre visible;
- búsqueda protegida por sesión, validación de longitud y normalización de entrada;
- índice compatible con el orden y la búsqueda definido durante el plan de `CAT-002` a partir de la consulta real;
- el cliente cancela solicitudes previas cuando sea posible y siempre ignora respuestas obsoletas.

La codificación del cursor es un detalle de infraestructura. No se expone en dominio, no concede autorización y nunca se interpola directamente en una consulta.

## Lecturas e Insights

El módulo `reporting` ofrece casos de uso de lectura o query services con contratos explícitos. Las páginas y gráficas no consultan Drizzle ni vuelven a implementar fórmulas económicas.

```text
Filtros validados
      ↓
Reporting query service
      ↓
Consultas agregadas + snapshots históricos
      ↓
Modelo de presentación de Insights
      ↓
Tarjeta / gráfica / detalle
```

Reglas:

- una métrica tiene una definición compartida por tarjeta, gráfica y detalle;
- filtros temporales se convierten a límites inequívocos usando la zona horaria configurada del negocio;
- todo agregado se calcula desde eventos y snapshots históricos, nunca desde precios o acuerdos actuales;
- el detalle debe poder reconciliar con su agregado;
- los modelos de presentación incluyen valor, unidad, periodo, cobertura y estado de datos;
- las consultas se diseñan primero para el volumen real de la etapa;
- índices, caché, vistas o agregados persistidos se añaden solo después de medir una necesidad;
- una caché nunca puede mezclar usuarios, filtros, periodos o datos previos a una escritura;
- el cliente recibe series agregadas y detalle paginado, no tablas completas para calcular métricas en el navegador.

La primera implementación visual usará el componente `Chart` basado en shadcn/ui y la librería compatible que se confirme durante el plan de `REP-002`. Cada gráfica requiere una alternativa tabular accesible.

## Validación y pruebas

### Unitarias

- reparto económico;
- redondeo monetario;
- snapshots históricos;
- descuentos;
- normalización del origen de demanda.

### Integración

- repositorios Drizzle;
- restricciones de PostgreSQL;
- casos de uso con persistencia.
- búsqueda de servicios con filtros, orden estable y cursores válidos o inválidos.

### End-to-end

- registrar visita con servicio;
- crear un catálogo durante la captura;
- buscar, paginar y seleccionar un servicio mediante autocomplete;
- registrar gasto;
- registrar oportunidad perdida;
- consultar resumen operativo.
- filtrar Insights y abrir el detalle de una métrica.

## Evolución posible

Solo cuando exista una necesidad demostrada:

```text
apps/
├── web/
└── api/

packages/
├── domain/
└── ui/
```

La API separada podría usar NestJS u otra tecnología Node/TypeScript, pero no forma parte de la V1.

## Publicación

Next.js se publica en Netlify según `netlify.toml`. PostgreSQL permanece externo. Las migraciones, el seed y el aprovisionamiento no corren en el build; el procedimiento está en `DEPLOYMENT.md`.

## Infraestructura diferida

La V1 incluye el acceso básico de `FND-002` y la publicación de Next.js en Netlify. Autenticación avanzada, roles, CI propio, monorepo, microservicios y un PostgreSQL administrado como producto del repositorio permanecen diferidos. Cada elemento se incorpora mediante una decisión explícita cuando aporte valor verificable.
