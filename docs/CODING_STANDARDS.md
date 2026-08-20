# Estándares de código

## Propósito

Este estándar adapta los principios de Explicit Architecture y Ports & Adapters del template `hexagonal-architecture` a Beauty Business: Next.js App Router, React, Zod, Drizzle y PostgreSQL en un monolito modular.

Las reglas ejecutables para agentes viven en `.cursor/rules/`. Este documento explica el estándar completo y sus razones.

## Principios

1. Las dependencias apuntan hacia el dominio y la aplicación.
2. El framework entrega solicitudes; no contiene reglas de negocio.
3. Los puertos pertenecen al consumidor que define la necesidad.
4. Los adaptadores implementan puertos sin filtrar tipos tecnológicos hacia adentro.
5. La arquitectura aparece cuando existe comportamiento real; no se crean abstracciones vacías.
6. Los datos históricos y el lenguaje ubicuo del negocio tienen prioridad sobre la comodidad del ORM o la UI.

## Capas por módulo

```text
src/modules/<module>/
├── domain/
│   ├── entity/
│   ├── value-object/
│   ├── error/
│   └── service/           # solo reglas que no pertenecen a una entidad
├── application/
│   ├── port/
│   │   ├── repository/
│   │   └── service/
│   └── use-case/
├── infrastructure/
│   ├── persistence/
│   └── mapper/
└── ui/
    ├── component/
    ├── action/
    └── schema/
```

No todos los módulos necesitan todas las carpetas. Se crean conforme las use una vertical.

## Límites de dependencias

| Desde | Puede depender de | No puede depender de |
|---|---|---|
| `domain` | propio dominio y utilidades puras | Next.js, React, Zod, Drizzle, PostgreSQL, UI, infraestructura |
| `application` | dominio y puertos de aplicación | Next.js, React, Drizzle, adaptadores concretos |
| `infrastructure` | dominio, aplicación y librerías externas | UI y componentes React |
| `ui` / `app` | contratos de aplicación, casos de uso expuestos y modelos de presentación | Drizzle, conexión DB, repositorios concretos |
| composition root | todas las capas para cablearlas | reglas de negocio propias |

`src/app/` es una capa de entrega. `src/shared/infrastructure/composition/` es la excepción autorizada para construir adaptadores y casos de uso.

No reexportar un símbolo a través de otra capa para ocultar una dependencia prohibida.

## Dominio

- Modelar conceptos con entidades y value objects cuando protejan invariantes reales.
- Usar nombres del dominio definidos en `DOMAIN.md`.
- Mantener entidades libres de decoradores de persistencia, validadores de entrada y tipos del framework.
- Las entidades protegen invariantes al construirse y al cambiar de estado; no deben permitir estados inválidos para corregirlos después.
- Los value objects son inmutables.
- El dinero usa una abstracción segura basada en unidades mínimas enteras o decimal explícito; nunca aritmética flotante.
- Fechas y horas deben declarar su semántica: instante, fecha local o intervalo. No usar strings ambiguos dentro del dominio.
- Los errores de dominio expresan significado del negocio y no códigos HTTP.
- No crear una clase base `Entity`, serialización genérica o herencia común hasta que dos casos reales demuestren el beneficio.

## Aplicación y casos de uso

- Un caso de uso representa una intención: `RegisterVisit`, `RegisterExpense`, `CreateProvider`.
- Definir entradas y salidas nominales; evitar parámetros primitivos posicionales largos.
- Inyectar puertos mediante el constructor. No importar implementaciones concretas.
- Coordinar entidades, repositorios, transacciones y servicios; no contener detalles HTTP o React.
- Los casos de uso de escritura definen claramente su frontera transaccional.
- Los errores esperados se modelan como resultados tipados cuando la UI debe mostrarlos; las fallas inesperadas se lanzan.
- No crear interfaces CRUD base ni servicios genéricos con métodos que el caso de uso no necesita.
- No devolver filas de Drizzle, `FormData`, `Request`, `Response` ni componentes React.

## Puertos y repositorios

- La interfaz de repositorio vive en `application/port/repository/` del módulo que la consume.
- El contrato se diseña desde los casos de uso, no desde las operaciones del ORM.
- Añadir solo métodos usados; evitar repositorios universales con CRUD completo.
- Usar términos del dominio: `findActiveAgreement`, no `selectAgreementRow`.
- No exponer queries, transacciones, columnas o tipos de Drizzle en el puerto.
- La implementación PostgreSQL/Drizzle vive en `infrastructure/persistence/`.
- Traducir entre persistencia y dominio mediante funciones o mappers dedicados cuando las formas difieran. No crear mapper ceremonial cuando sean idénticas y seguras.
- No eliminar físicamente datos referenciados históricamente cuando el dominio exige desactivación.

## Paginación por cursor y autocomplete

- Usar keyset pagination para el catálogo de servicios; no usar `OFFSET` para recorrerlo.
- Todo orden paginado debe ser estable y terminar en una clave única como `id`.
- El cursor es opaco fuera de infraestructura, se valida antes de usarlo y contiene las claves mínimas para continuar más la información necesaria para comprobar que pertenece a la búsqueda, filtros y orden activos.
- Nunca interpolar un cursor, búsqueda u orden en SQL; usar expresiones tipadas y parámetros del adaptador.
- Definir límites predeterminado y máximo en el caso de uso. El cliente no controla tamaños arbitrarios.
- Devolver un contrato acotado: `items`, `nextCursor` y `hasNextPage`; no fingir totales o números de página.
- Reiniciar el cursor cuando cambien búsqueda, filtros u orden.
- Hacer la búsqueda server-side y devolver modelos mínimos de opción; no descargar el catálogo para filtrarlo en React.
- Identificar y combinar opciones por `id`, no por etiqueta.
- En autocomplete, aplicar debounce en la UI y cancelar o ignorar solicitudes obsoletas mediante un identificador de búsqueda o `AbortSignal` cuando el mecanismo de entrega lo permita.
- No incorporar una respuesta si ya no corresponde al texto, filtros o cursor activos.
- Probar claves repetidas de orden, primera y última página, cursor inválido, cambios concurrentes, filtros, caracteres especiales y respuestas fuera de orden.

## Composition root e inyección

- La construcción de dependencias vive en un composition root server-only.
- Preferir inyección por constructor y fábricas explícitas.
- No introducir Inversify u otro contenedor hasta que la composición manual sea un problema demostrado.
- Ningún módulo debe importar el composition root desde dominio o aplicación.

## Next.js como capa de entrega

### Componentes

- Los componentes son Server Components por defecto.
- Añadir `'use client'` solo en la frontera interactiva más pequeña que necesite estado, efectos o APIs del navegador.
- No importar módulos server-only desde el grafo cliente.
- Los datos enviados a Client Components deben ser serializables y mínimos.

### Server Actions

- Tratar cada Server Action como un endpoint POST no confiable.
- Validar entrada en el borde con Zod y convertirla a un comando de aplicación.
- Cuando exista autenticación, autorizar dentro de cada acción; ocultar un botón no constituye seguridad.
- No aceptar del cliente datos que pueden derivarse de una fuente confiable.
- Devolver estados de presentación acotados; nunca filas de DB ni secretos.
- No depender de acciones paralelas desde el cliente; Next.js las despacha secuencialmente.
- La acción no contiene reglas: llama a un caso de uso y traduce su resultado.

### Route Handlers

- Crear `route.ts` solo cuando exista un consumidor HTTP real o una necesidad distinta del formulario interno.
- Usar `Request`/`Response` o tipos de Next únicamente en la capa de entrega.
- Validar todo input y llamar a casos de uso.
- No mezclar `route.ts` y `page.tsx` en el mismo segmento.
- Rutas nuevas usan recursos y segmentos `kebab-case`; parámetros dinámicos claros.
- No cambiar una URL existente sin autorización explícita y documentación del cambio incompatible.

### Páginas y Server Components

- Pueden consultar mediante casos de uso de lectura o query services.
- No acceden directamente a Drizzle o PostgreSQL.
- Usar `notFound` y estados de UI para resultados esperados; dejar que fallas inesperadas lleguen a un error boundary.

## Esquemas de entrada y DTOs

- Zod vive en bordes de entrada o configuración, no en entidades de dominio.
- Separar `Input`, comandos de aplicación, modelos de dominio, filas de persistencia y modelos de presentación cuando sus responsabilidades difieran.
- No crear una jerarquía universal de DTOs ni métodos genéricos `serialize`/`deserialize`.
- Un mapper debe tener una razón concreta: cambio de nombres, tipos, invariantes o forma externa.

## Reporting e Insights

- Definir cada métrica en un contrato reutilizable; tarjeta, gráfica y detalle no mantienen fórmulas independientes.
- Calcular agregados en query services server-side, no en componentes React ni descargando filas completas al navegador.
- Validar filtros y límites con Zod en el borde; normalizarlos antes de ejecutar consultas.
- Interpretar fechas en la zona horaria configurada del negocio y convertirlas a límites inequívocos para persistencia.
- Usar snapshots históricos para precios, acuerdos y repartos.
- Distinguir venta bruta, ingreso del salón, monto de colaboradores, receptor del pago, egresos y resultado operativo preliminar.
- No llamar utilidad, ganancia neta o flujo de caja al resultado operativo preliminar.
- Toda métrica debe declarar unidad, periodo, cobertura y comportamiento sin datos.
- El drill-down debe reconciliar con el agregado bajo los mismos filtros.
- Optimizar consultas a partir de medición. No introducir vistas materializadas, almacenes analíticos o caché preventiva.
- Las series enviadas al cliente contienen solo puntos agregados necesarios; el detalle siempre se pagina.
- Probar límites inclusivos, zona horaria, periodos sin datos, divisiones por cero, redondeos y combinación de filtros.

## Configuración y secretos

- El acceso a `process.env` se centraliza en `src/shared/infrastructure/config/env.ts` y en archivos de configuración raíz que Next/Drizzle deban ejecutar fuera del runtime.
- El módulo valida variables con Zod, exporta una configuración tipada y se marca `server-only`.
- `.env*` permanece en la raíz, aunque la aplicación use `src/`.
- Mantener `.env.example` sin secretos y documentar cada variable.
- Una variable `NEXT_PUBLIC_` es pública, se integra al bundle y queda fijada en build; nunca contiene secretos.
- Código cliente no importa configuración privada.

## Autenticación y autorización

- Aplicar denegación por defecto: toda ruta y operación de negocio exige sesión salvo que esté declarada públicamente.
- Validar la sesión en el servidor dentro de cada Server Action, Route Handler y lectura protegida. Ocultar UI o depender solo de middleware no autoriza una operación.
- Usar una librería mantenida y compatible con la versión instalada. No implementar criptografía, hashing o un protocolo de sesión propio.
- Guardar contraseñas únicamente mediante un hash adaptativo aprobado con salt; nunca cifrarlas reversiblemente ni usar hashes rápidos.
- No almacenar tokens de autenticación o sesión en `localStorage` o `sessionStorage`.
- Las cookies de sesión de producción deben ser `HttpOnly`, `Secure`, tener `SameSite` explícito, alcance mínimo y expiración.
- Invalidar la sesión del lado servidor al cerrar sesión o revocar acceso.
- No aceptar una URL de retorno externa; validar destinos de redirección contra rutas internas permitidas.
- Responder fallos de credenciales con mensajes y tiempos que no revelen si una cuenta existe.
- Aplicar throttling temporal y progresivo a intentos repetidos sin crear un bloqueo permanente explotable como denegación de servicio.
- Nunca registrar contraseñas, hashes, cookies, tokens ni cuerpos de autenticación.
- Credenciales reales no se versionan ni se pasan como argumentos visibles del shell.
- Las variables `BOOTSTRAP_USER_*` solo las leen scripts administrativos; no entran al esquema de `env.ts` ni al runtime de Next.js.

## Ambiente local e infraestructura

- Toda dependencia de infraestructura necesaria para desarrollo local se ejecuta mediante el `compose.yaml` del repositorio.
- La aplicación Next.js se ejecuta en el host; no se incluye en el Compose de desarrollo.
- PostgreSQL es el único servicio inicial. Servicios adicionales requieren una necesidad funcional documentada.
- Usar imágenes con versión explícita; nunca `latest`.
- Cada servicio debe tener healthcheck y configuración reproducible.
- Usar volúmenes nombrados para datos persistentes que deban sobrevivir a reinicios.
- No fijar `container_name`; permitir que Compose aísle proyectos y evite colisiones.
- No ejecutar migraciones, seeds ni resets destructivos automáticamente al iniciar contenedores.
- `docker compose down` no debe eliminar volúmenes por defecto. La eliminación de datos requiere un comando separado y explícito.
- No almacenar secretos en `compose.yaml`; usar variables documentadas y archivos locales ignorados por Git.

## Errores

- En cada `catch`, tratar el valor como `unknown`.
- Normalizar antes de leer `message`, `stack` u otras propiedades.
- Si se envuelve una falla inesperada, conservarla mediante `cause`.
- No capturar solo para volver a lanzar el mismo error.
- No ocultar errores con `catch {}` salvo que ignorarlos sea parte explícita y probada del flujo.
- Errores esperados de validación o negocio se muestran como resultados; errores inesperados llegan a límites de error y observabilidad.
- Los adaptadores traducen errores tecnológicos a errores de aplicación sin exponer detalles de DB a la UI.

## Logging y privacidad

- Preferir un evento rico por operación sobre muchos mensajes dispersos.
- Registrar identificadores técnicos, duración, conteos, resultado y tipo de operación cuando aporten diagnóstico.
- Nunca registrar nombres de clientas, teléfonos, correos, notas libres, comprobantes, tokens, secretos, cuerpos completos ni datos financieros innecesarios.
- No usar `console.log` en código de aplicación. El logger se añadirá en infraestructura cuando exista una necesidad operativa; mientras tanto, evitar logging incidental.
- Una falla no se registra repetidamente en cada capa.

## TypeScript y estilo

- `strict` permanece habilitado.
- Evitar `any`; preferir `unknown` y estrechamiento explícito.
- Usar `type` para uniones y composiciones; `interface` para contratos extensibles cuando aporte claridad. No imponer prefijo `I`.
- Clases, componentes y tipos: `PascalCase`. Funciones, variables y métodos: `camelCase`. Constantes globales reales: `UPPER_SNAKE_CASE`.
- Archivos: `kebab-case`; los nombres especiales de Next conservan su convención.
- Booleanos usan prefijos semánticos como `is`, `has`, `can`, `should`.
- Evitar números mágicos; nombrar porcentajes, límites y estados relevantes.
- Preferir funciones pequeñas, early returns y una responsabilidad principal por archivo.
- No añadir `eslint-disable`, `@ts-ignore` o casts inseguros para silenciar problemas salvo una excepción documentada y justificada.
- Ordenar imports por: plataforma/framework, paquetes, alias internos, relativos y tipos cuando el linter no lo haga automáticamente.

## Documentación del código

- Documentar decisiones y semántica, no repetir la firma.
- JSDoc es obligatorio para APIs públicas o conceptos de dominio cuando el contrato no sea evidente.
- No exigir JSDoc ceremonial para cada constructor, método privado o componente obvio.
- No añadir etiquetas `@ai`; Git y las métricas de los planes registran la participación del agente sin contaminar el código.
- Cambios de dominio, arquitectura o alcance actualizan sus documentos en el mismo cambio.

## Base de datos y migraciones

- Cada cambio de esquema crea una migración nueva; nunca editar una migración ya aplicada.
- Usar constraints para invariantes que PostgreSQL pueda garantizar.
- Las migraciones deben ser deterministas y revisables.
- Separar nombres de dominio de detalles SQL mediante el adaptador.
- Evitar JSONB para relaciones ya comprendidas; reservarlo para metadatos experimentales.
- Las pruebas de integración validan mapeos, constraints y transacciones relevantes.

## Pruebas

- Toda regla de negocio nueva o modificada requiere prueba.
- Entidades y value objects: pruebas unitarias deterministas.
- Casos de uso: pruebas con fakes o stubs de puertos.
- Adaptadores Drizzle: pruebas de integración contra PostgreSQL de prueba.
- Flujos críticos: Playwright end-to-end cuando el harness exista.
- Usar Arrange–Act–Assert o Given–When–Then de forma visible.
- No instanciar infraestructura real en pruebas unitarias.
- Evitar tests que solo confirmen que una clase existe sin probar comportamiento útil.
- Un bug corregido debe incluir una prueba de regresión cuando sea razonable.

## Validación antes de terminar

Para cambios en TypeScript/JavaScript, ejecutar en orden cuando los scripts existan:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Para cambios solo de documentación o reglas, validar enlaces, formato y `git diff --check`; no ejecutar toda la suite sin necesidad.

No ocultar fallas. Si un script todavía no existe por estar pendiente `FND-001`, indicarlo explícitamente.
