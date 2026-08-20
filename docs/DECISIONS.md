# Registro de decisiones

## D-001 — Medir antes de construir el sistema completo

**Estado:** aceptada.

La etapa 0 crea control operativo y una línea base. No se construirá todavía un POS, CRM, agenda, nómina, contabilidad ni inventario avanzado.

## D-002 — Miniaplicación propia de captura

**Estado:** aceptada; reemplaza la alternativa inicial de Google Forms.

Se evaluaron tres caminos:

1. Google Forms manuales.
2. Formularios como código que generaran Google Forms y sincronizaran respuestas.
3. Miniaplicación propia con formularios y catálogos.

Google Forms resolvía rápidamente la captura y el enfoque forms-as-code permitía versionar definiciones. Sin embargo, la necesidad de agregar, editar y desactivar servicios, productos, personal y proveedores durante la operación convirtió los catálogos dinámicos en una capacidad central.

La decisión final es una aplicación propia, deliberadamente pequeña. Google Forms permanece como alternativa histórica, no como parte de la arquitectura objetivo.

## D-003 — UI y backend juntos

**Estado:** aceptada.

Next.js alojará UI y mecanismos de entrega en un monolito modular. Separar API y frontend desde el inicio añadiría repositorios, CORS, contratos, pipelines, despliegues y autenticación cruzada sin beneficio proporcional para 1–5 usuarios.

## D-004 — PostgreSQL sobre MongoDB

**Estado:** aceptada.

MongoDB podría servir para una PoC de documentos flexibles, pero el producto necesita relaciones, integridad, históricos de acuerdos y consultas analíticas. PostgreSQL será el sistema de registro; JSONB cubrirá metadatos todavía experimentales.

## D-005 — Eventos individuales sobre totales manuales

**Estado:** aceptada.

Ventas, clientes y duraciones se reconstruyen desde visitas y servicios realizados. El cierre diario se utiliza para validar, no para sustituir el detalle.

## D-006 — Tres dimensiones económicas

**Estado:** aceptada.

Cada servicio distingue:

- venta bruta o GMV;
- ingreso del salón;
- monto del colaborador.

La palabra «ingreso» sin calificativo es ambigua y debe evitarse en código, UI y reportes.

## D-007 — Snapshot de acuerdos

**Estado:** aceptada.

Una modificación en la comisión o acuerdo actual nunca recalcula el pasado. Cada transacción conserva el porcentaje, tipo e importes utilizados.

## D-008 — Demanda del salón frente a demanda del colaborador

**Estado:** aceptada.

El origen de la clienta se registra para estimar la dependencia comercial y la demanda potencialmente reasignable si un colaborador deja el negocio.

## D-009 — Git como fuente de verdad de la PoC

**Estado:** aceptada.

Producto, dominio, arquitectura, especificaciones, planes y métricas del agente se versionan en el repositorio. No se introduce Jira o Linear durante esta etapa.

## D-010 — Desarrollo agent-first

**Estado:** aceptada.

El flujo es:

```text
Producto
  → Dominio
  → Arquitectura
  → Especificación
  → Plan de ejecución
  → Aprobación humana
  → Implementación del agente
  → Pruebas y revisión
```

Los planes se requieren para cambios complejos; tareas pequeñas y acotadas pueden implementarse directamente si sus criterios ya son inequívocos.

## D-011 — Infraestructura mínima al inicio

**Estado:** aceptada.

Primero: documentación, arquitectura, base local, pruebas mínimas y primera vertical. La publicación en una URL accesible desde Internet justificó añadir el acceso básico de `D-016`; autenticación avanzada, CI, cloud y separación de servicios siguen diferidos hasta que exista una razón concreta.

## D-012 — Estándar hexagonal adaptado

**Estado:** aceptada.

Beauty Business adopta los límites, puertos, adaptadores, casos de uso, configuración centralizada, manejo de errores y disciplina de validación del template local `hexagonal-architecture`.

La adaptación usa módulos verticales, Next.js App Router, Zod, Drizzle y PostgreSQL. No copia Inversify, Express controllers, Swagger, RabbitMQ, MongoDB/MSSQL, JSDoc exhaustivo ni etiquetas `@ai`, porque son mecanismos específicos o innecesarios para la etapa actual.

El estándar normativo vive en `CODING_STANDARDS.md`; las reglas aplicables a todos los agentes viven en `.cursor/rules/` y deben ser cargadas mediante `AGENTS.md`.

## D-013 — Dependencias locales mediante Docker Compose

**Estado:** aceptada.

Todo servicio de infraestructura necesario para levantar un ambiente local se ejecutará mediante Docker Compose. PostgreSQL será el único servicio inicial; otras dependencias se añadirán solo cuando una funcionalidad aprobada las requiera.

La aplicación Next.js queda fuera del Compose de desarrollo y se ejecuta en el host con npm para mantener un ciclo rápido de edición y hot reload.

El arranque de contenedores no ejecutará automáticamente migraciones, seeds ni operaciones destructivas. Esas acciones tendrán comandos explícitos y revisables.

## D-014 — Sistema visual rosa y claro basado en shadcn/ui

**Estado:** aceptada.

La interfaz se construirá de forma incremental con componentes y patrones basados en shadcn/ui, personalizados mediante tokens CSS semánticos. La primera versión será light-first: blancos cálidos y superficies claras con un oro rosa oscuro y sobrio como color principal; un tono cobrizo más claro se reserva como acento y los estados de éxito, advertencia, información y error conservan colores propios.

Las acciones, navegación y componentes relevantes se acompañan con iconografía consistente. Toda pregunta incluye ayuda contextual accesible mediante un icono de información. Hover, foco, selección, capas y navegación usan movimiento breve para confirmar respuesta, respetando movimiento reducido.

Toda operación asíncrona presenta loading proporcional. Los errores visibles se normalizan e interpretan, ofrecen una recuperación y nunca exponen códigos HTTP o detalles internos.

No se inventará un logotipo o identidad comercial. La estructura admitirá un slot de marca opcional cuando exista un activo aprobado. La especificación normativa completa vive en `DESIGN.md`.

## D-015 — El sistema sugiere y la operación decide los importes finales

**Estado:** aceptada.

El precio de lista y el acuerdo económico vigente alimentan una sugerencia automática. Esa sugerencia reduce cálculos manuales, pero no impone el precio cobrado ni el reparto de una sesión concreta.

La persona que registra puede confirmar o modificar la venta bruta, el ingreso del salón y el monto del colaborador. El reparto final debe conservar la igualdad económica aplicable. Cuando el precio final difiere del precio de lista o el reparto final difiere de la sugerencia, se requiere un motivo normalizado y, para `Otro`, una explicación.

Cada servicio realizado conserva tanto la sugerencia como la decisión final y sus motivos. Esto permite analizar descuentos, cargos adicionales y acuerdos excepcionales sin perder el contexto histórico ni modificar el catálogo o acuerdo general.

## D-016 — Acceso básico para dos cuentas sin registro

**Estado:** aceptada.

La aplicación podrá estar disponible en una URL pública, pero todo dato y operación de negocio quedará detrás de autenticación. Existirán dos cuentas individuales con el mismo acceso completo; no se utilizará una contraseña compartida.

La V1 incluye identificador y contraseña, sesión segura, cierre de sesión, aprovisionamiento administrativo y protección contra intentos repetidos. No incluye registro, recuperación de contraseña, roles, MFA, SSO, acceso social ni panel de usuarios.

«Básico» describe el alcance funcional, no una reducción de los controles mínimos: las contraseñas se guardan con hash adaptativo, las sesiones se validan en el servidor y usan cookies seguras, los fallos no enumeran cuentas y ningún secreto se versiona o registra.

## D-017 — Insights trazables sobre los eventos operativos

**Estado:** aceptada.

La V1 incluirá una sección protegida `Insights` con filtros por día, semana, mes, año, últimos 30 días y rango personalizado. Mostrará gráficas de ingresos, egresos, pagos, actividad, precios, repartos y demanda, además de comparación opcional con el periodo anterior.

Las visualizaciones no crean una segunda interpretación de los datos: reutilizan las definiciones de `REP-001`, calculan desde eventos y snapshots históricos y permiten llegar a los registros fuente.

Venta bruta, ingreso del salón, monto de colaboradores, receptor del pago y egresos permanecen separados. `Ingreso del salón - egresos registrados` se denomina `resultado operativo preliminar` y nunca utilidad o ganancia neta, porque no sustituye contabilidad, impuestos, conciliación bancaria ni costos todavía no capturados.

## D-018 — Catálogo de servicios con cursor y autocomplete remoto

**Estado:** aceptada.

El catálogo de servicios no se descargará completo ni usará `OFFSET` para recorrer resultados. El listado y la selección operativa comparten una consulta server-side con paginación keyset, cursor opaco, límite acotado y orden estable por nombre normalizado e identificador.

La captura utiliza un autocomplete basado en `Combobox`: busca servicios activos por nombre o categoría, aplica debounce, ignora respuestas obsoletas, permite cargar la siguiente página y conserva la selección por identificador. Si no existe una opción adecuada, mantiene el alta contextual ya definida y selecciona el servicio nuevo al volver.

No se promete un snapshot congelado entre páginas cuando el catálogo cambia concurrentemente. La UI combina por identificador y permite actualizar desde el inicio.

## D-019 — Visita multiservicio y pagos a nivel de visita

**Estado:** aceptada.

Una visita contiene una o más líneas de servicio y cada línea puede pertenecer a una colaboradora distinta. Precio, acuerdo, sugerencia, reparto, duración y motivos se guardan por línea; fecha, clientela, origen, método de pago y receptor inicial se guardan una sola vez en la visita.

Esta decisión evita duplicar datos comunes y permite medir correctamente una atención con varios prestadores. Pagos parciales o distintos métodos dentro de una misma visita permanecen fuera de alcance.

## D-020 — Servicio temporal que puede completarse después

**Estado:** aceptada.

Si un servicio no existe, la operación puede crearlo y seleccionarlo dentro de la visita o guardar una línea temporal. La línea temporal conserva nombre, categoría, precio, reparto y demás snapshots; aparece en una bandeja de pendientes para completar la ficha y enlazarla después sin modificar la transacción histórica.

## D-021 — Aprovisionamiento separado del seed

**Estado:** aceptada.

`db:seed` crea únicamente catálogos no sensibles e idempotentes. Las cuentas se crean o actualizan con `auth:provision`, que pide la contraseña sin eco en una terminal interactiva y almacena solo Argon2id. Así, credenciales reales no viven en archivos seed, `.env.example`, argumentos, URLs ni logs.

## D-022 — Compras, catálogos auxiliares y demanda perdida ampliada

**Estado:** aceptada.

Los egresos distinguen compra y gasto operativo, requieren categoría y pueden conservar producto, proveedor, cantidad, unidad, costo unitario y referencia de comprobante. Los tres catálogos permiten alta contextual y baja lógica.

Las oportunidades perdidas separan fecha de captura, fecha solicitada, canal, tipo de cliente, origen, servicio y motivo; cancelación y no-show son motivos normalizados.

## D-023 — Filtros de Insights aplicados por fuente

**Estado:** aceptada.

Los filtros globales se aplican solo a fuentes donde existe la dimensión: colaboradora y servicio filtran líneas realizadas; categoría, producto y proveedor filtran egresos; motivo de pérdida filtra oportunidades. Periodo, método, origen o tipo de cliente se aplican a las fuentes compatibles y la UI explica esta cobertura.

Los agregados de servicios se calculan siempre a nivel de línea para que filtrar una visita multiservicio no incluya importes de otras líneas. El detalle usa paginación keyset por fecha e identificador y vincula el cursor a la fuente y filtros que lo originaron.
