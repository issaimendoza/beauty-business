# Diseño de experiencia e interfaz

## Estado y autoridad

Este documento define el sistema de diseño objetivo de Beauty Business para la primera versión. Es normativo para cualquier pantalla, componente o texto visible por el usuario.

La implementación base existe en `src/app/globals.css`, `src/components/ui` y el shell de navegación. Si una necesidad real exige apartarse de este documento, el cambio debe documentarse aquí y en `DECISIONS.md` antes de consolidarse como una nueva convención.

## Objetivo de experiencia

La aplicación debe sentirse cálida, clara, profesional y rápida. Está diseñada principalmente para registrar operaciones desde un teléfono en medio del trabajo, no para exhibir una identidad visual compleja.

La interfaz debe:

- permitir completar los flujos frecuentes en 20–40 segundos;
- reducir escritura, cálculos y decisiones innecesarias;
- comunicar de inmediato que una acción fue recibida y está avanzando;
- explicar los conceptos de negocio sin exponer términos técnicos;
- conservar el contexto y los datos capturados cuando algo falla;
- funcionar con teclado, lector de pantalla y dispositivos táctiles.

## Principios

### 1. Claridad antes que decoración

Cada elemento visual debe ayudar a entender, elegir, confirmar o corregir. No se agregarán adornos que compitan con la captura operativa.

### 2. Una acción siempre responde

Hover, foco, presión, selección, carga, éxito y error deben tener una respuesta visible. Una acción nunca debe parecer ignorada.

### 3. Ayuda en el lugar donde surge la duda

Las preguntas y conceptos que puedan ser ambiguos llevan una ayuda contextual mediante un icono de información. La persona no debe abandonar el formulario para entender qué se solicita.

### 4. Lenguaje humano

La UI interpreta validaciones y errores. Nunca muestra códigos HTTP, trazas, nombres de tablas, excepciones o mensajes crudos del servidor.

### 5. Consistencia sobre originalidad

Se prefieren patrones y componentes basados en shadcn/ui. No se construirá una biblioteca visual paralela ni se modificarán componentes de forma aislada para cada pantalla.

## Estado de marca y logotipo

Todavía no existe un nombre comercial confirmado, logotipo, isotipo ni manual de marca.

Reglas mientras no exista una marca aprobada:

- no inventar un logotipo, monograma, símbolo ni eslogan;
- no utilizar un icono genérico como si fuera el logotipo;
- usar el texto funcional `Beauty Business` únicamente como nombre del producto;
- contemplar un `BrandSlot` opcional en el encabezado y la navegación;
- cuando el slot no tenga contenido, la composición debe cerrarse sin mostrar un recuadro vacío ni dejar un hueco extraño;
- el futuro activo de marca debe poder incorporarse sin rediseñar la navegación.

El slot es una previsión estructural, no un elemento visible pendiente.

## Sistema visual

### Tema

La primera versión será **light-first**. El modo oscuro no forma parte del alcance inicial. Todas las superficies principales usarán blancos cálidos y tonos muy claros; un oro rosa sobrio será el color predominante de identidad y acción, sin convertir toda la interfaz en una superficie rosada.

### Paleta inicial

Los valores son la referencia visual aprobada para iniciar `FND-001`. Deben implementarse como tokens semánticos de CSS compatibles con el tema de shadcn/ui, no como colores hexadecimales repetidos por los componentes.

| Token semántico | Referencia | Uso |
|---|---:|---|
| `background` | `#FFFCFA` | Fondo general marfil, cálido y muy claro. |
| `foreground` | `#302326` | Texto principal. |
| `card` / `popover` | `#FFFFFF` | Tarjetas, diálogos y menús. |
| `primary` | `#9F5965` | Oro rosa oscuro para acción principal, selección fuerte y navegación activa. |
| `primary-foreground` | `#FFFFFF` | Texto e iconos sobre `primary`. |
| `primary-hover` | `#874A54` | Hover y presión de la acción principal. |
| `secondary` | `#F7EDEB` | Acciones secundarias y fondos seleccionados suaves. |
| `secondary-foreground` | `#643F45` | Contenido sobre `secondary`. |
| `muted` | `#F8F3F1` | Fondos auxiliares y estados discretos. |
| `muted-foreground` | `#6F5D60` | Texto secundario. |
| `border` / `input` | `#EADBD8` | Bordes y controles. |
| `ring` | `#9F5965` | Indicador de foco. |
| `accent-rose-gold` | `#C98F87` | Detalles cálidos o destacados grandes. No usar para texto pequeño sobre blanco. |
| `destructive` | `#B42318` | Error o acción destructiva. |
| `warning` | `#B54708` | Advertencia. |
| `success` | `#067647` | Confirmación y éxito. |
| `info` | `#175CD3` | Información neutral cuando el rosa pueda confundirse con selección. |

El rosa no sustituye los colores semánticos. Error, advertencia, éxito e información deben distinguirse por color, icono y texto. Ningún significado puede depender solo del color.

Antes de liberar una pantalla, las combinaciones reales deben verificarse con contraste WCAG 2.2 AA. Si un valor de referencia no alcanza el contraste en su contexto, se ajustará el token conservando la intención visual y se documentará el cambio.

### Variables de shadcn/ui

El tema debe utilizar variables CSS semánticas. Como mínimo:

```text
background / foreground
card / card-foreground
popover / popover-foreground
primary / primary-foreground
secondary / secondary-foreground
muted / muted-foreground
accent / accent-foreground
destructive / destructive-foreground
border / input / ring
sidebar / sidebar-foreground / sidebar-primary / sidebar-accent
chart-1 ... chart-5
```

Los componentes consumen tokens como `bg-primary`, `text-foreground` o `border-border`. No deben usar clases de color literal como contrato visual permanente.

### Tipografía

Se mantiene una tipografía sans serif legible y neutral. El scaffold actual puede conservar Geist Sans mientras no exista una decisión de marca que justifique cambiarla.

Escala inicial:

| Estilo | Tamaño orientativo | Uso |
|---|---:|---|
| Título de página | 28–32 px | Un título principal por vista. |
| Encabezado de sección | 20–24 px | Secciones de formulario o resumen. |
| Subtítulo | 18 px | Agrupaciones internas. |
| Cuerpo y controles | 16 px | Lectura y captura principal. |
| Texto auxiliar | 14 px | Ayudas, metadatos y tablas. |
| Etiqueta compacta | 12 px | Badges; nunca para información crítica. |

Usar `sentence case`. Evitar mayúsculas sostenidas, pesos excesivos y más de tres jerarquías tipográficas visibles en una misma sección.

### Espaciado, formas y profundidad

- unidad base: 4 px;
- separaciones habituales: 8, 12, 16, 24 y 32 px;
- controles táctiles: mínimo 44 × 44 px;
- radio de controles: 10–12 px;
- radio de tarjetas, drawers y diálogos: 14–16 px;
- sombras: suaves, cortas y reservadas para capas elevadas;
- bordes: preferibles a sombras fuertes para separar contenido;
- ancho máximo de contenido administrativo: aproximadamente 1280 px.

No usar glassmorphism, neón, sombras coloreadas intensas o gradientes decorativos extensos. Un gradiente rosa muy sutil puede aparecer en una superficie de bienvenida, pero nunca debe reducir legibilidad ni convertirse en el fondo habitual de los formularios.

## Estructura responsiva

### Móvil

- una columna;
- navegación inferior o menú `Sheet`, según la cantidad final de destinos;
- acción principal visible y, cuando sea útil, fija al borde inferior;
- drawers para tareas secundarias y formularios breves;
- tablas convertidas en tarjetas o listas legibles;
- sin interacciones que dependan exclusivamente de hover.

### Tableta

- una o dos columnas según la tarea;
- formularios conservan una ruta de lectura clara;
- navegación lateral compacta cuando exista espacio suficiente.

### Escritorio

- sidebar persistente con icono y etiqueta;
- contenido centrado con ancho controlado;
- paneles secundarios solo cuando reduzcan navegación o comparación;
- diálogos para tareas breves y drawers para contexto complementario.

La prioridad no es mostrar más información por tener más espacio, sino evitar recorridos y cambios de contexto innecesarios.

## Arquitectura de navegación

La estructura inicial esperada es:

```text
Inicio
Registrar
  Visita y servicios
  Gasto
  Oportunidad perdida
Catálogos
  Personal
  Servicios
  Productos y proveedores, cuando entren al alcance
Insights
```

Cada destino de navegación debe tener icono y etiqueta. El estado activo utiliza color, fondo y/o indicador lateral; nunca depende únicamente del icono rosa.

En móvil, la navegación inferior debe reservarse para un máximo razonable de destinos frecuentes. Los destinos secundarios se agrupan en un menú explícito, no en iconos crípticos.

## Componentes basados en shadcn/ui

Se adoptarán componentes de shadcn/ui de forma incremental, solo cuando una funcionalidad aprobada los necesite.

Base prevista:

| Necesidad | Componente o patrón base |
|---|---|
| Acciones | `Button`, `Button Group` cuando corresponda. |
| Contenido agrupado | `Card`, `Separator`, `Badge`. |
| Formularios | `Field`, `Label`, `Input`, `Input Group`, `Textarea`, `Checkbox`, `Radio Group`, `Switch`. |
| Selección | `Select`; `Combobox` + `Command` para catálogos con búsqueda. |
| Capas | `Dialog`, `Drawer`, `Sheet`, `Popover`, `Tooltip`. |
| Confirmación riesgosa | `Alert Dialog`. |
| Estado | `Alert`, `Empty`, `Skeleton`, `Spinner`, `Progress`, `Toast`/`Sonner`. |
| Navegación | `Sidebar`, `Tabs`, `Breadcrumb` solo donde agregue contexto. |
| Datos | `Table` o `Data Table`; patrón de tarjetas en móvil. |
| Visualización | `Chart` con tooltips, leyendas y capa accesible; tabla equivalente obligatoria. |
| Menús | `Dropdown Menu` con iconos y etiquetas. |

Reglas:

- instalar o copiar solo los componentes usados;
- personalizar mediante tokens y variantes compartidas;
- no alterar internamente un componente por una sola pantalla si una composición lo resuelve;
- conservar las capacidades de foco, teclado y cierre de las primitivas;
- usar `Dialog` en escritorio y considerar `Drawer` en móvil cuando sea el mismo propósito;
- no convertir cada tarea en un modal: una actividad larga o con navegación propia merece una página.

## Iconografía

Todas las acciones y elementos de navegación deben estar acompañados por un icono cuando este ayude a reconocerlos con rapidez.

### Reglas

- utilizar una sola familia consistente, preferentemente Lucide al iniciar la UI;
- botón normal: icono más texto;
- menú y navegación: icono más etiqueta;
- campos especiales, estados vacíos, alertas y resultados: icono coherente con el significado;
- reservar botones solo con icono para acciones universalmente reconocibles y contextos estrechos;
- un botón solo con icono requiere `aria-label` y `Tooltip`;
- no usar un icono decorativo como si fuera una acción;
- tamaño habitual: 16 px en botones, 18–20 px en navegación y 20–24 px en estados;
- mantener grosor y alineación visual consistentes.

Mapa orientativo:

| Concepto | Iconos candidatos |
|---|---|
| Inicio | `House` |
| Registrar | `CirclePlus` |
| Visita/servicio | `Sparkles` o `Scissors` |
| Gasto | `Receipt` |
| Oportunidad perdida | `CalendarX` |
| Personal | `Users` |
| Catálogo | `BookOpen` o un icono específico del catálogo |
| Insights | `ChartNoAxesCombined` |
| Guardar | `Save` |
| Editar | `Pencil` |
| Eliminar | `Trash2` |
| Buscar | `Search` |
| Cerrar | `X` |
| Ayuda contextual | `Info` |

Este mapa puede ajustarse para evitar iconos ambiguos, pero debe mantenerse centralizado. Los iconos no forman parte de la futura identidad de marca.

## Preguntas y ayuda contextual

Toda pregunta de formulario debe tener una ayuda contextual accesible mediante un icono `Info`. También deben usarla los componentes cuyo efecto, cálculo o consecuencia no sea evidente.

Patrón requerido:

```text
Etiqueta o pregunta   [i]
Control
Descripción persistente, solo si es necesaria para completar correctamente
```

Comportamiento:

- en escritorio, la ayuda abre con hover y foco mediante `Tooltip`;
- al hacer clic o presionar, debe permanecer visible mediante `Popover` o un patrón táctil equivalente;
- en móvil, nunca depender exclusivamente del hover;
- se cierra con `Escape`, al presionar fuera o con una acción de cierre clara cuando corresponda;
- el disparador debe ser un botón alcanzable por teclado, con nombre accesible como `Más información sobre origen de la clienta`;
- el texto explica qué significa, por qué se pide y, si ayuda, incluye un ejemplo breve;
- la ayuda no puede ocultar instrucciones indispensables para completar el campo;
- los errores del campo se muestran por separado de la ayuda.

Debe existir un componente compartido como `FieldHelp`, en lugar de reconstruir este patrón en cada formulario.

Ejemplo de contenido:

```text
¿Quién consiguió a la clienta? [i]

Esta información permite distinguir la demanda que llegó por el salón
de la que trajo la colaboradora. Ejemplo: selecciona “Salón” si la clienta
llegó por redes, recomendación o ubicación del negocio.
```

## Interacción y movimiento

Todos los componentes interactivos deben comunicar su cambio de estado con movimiento o transición sutil. La animación confirma una respuesta; no es un espectáculo.

### Duraciones orientativas

| Interacción | Duración |
|---|---:|
| Hover, foco, color y elevación | 120–180 ms |
| Presión y selección | 100–160 ms |
| Tooltip, popover y menú | 140–200 ms |
| Dialog, drawer y sheet | 180–240 ms |
| Cambio de contenido o página | 200–300 ms |
| Toast | entrada/salida breve, legible y no invasiva |

### Movimiento permitido

- cambio de color o borde;
- opacidad;
- desplazamiento de 4–8 px;
- escala aproximada de `0.98` a `1`;
- rotación breve de un chevron;
- skeleton o spinner durante espera;
- transición suave al expandir o contraer contenido.

### Movimiento no permitido

- rebotes repetidos;
- zoom pronunciado;
- parallax;
- animaciones decorativas continuas;
- desplazamientos que cambien inesperadamente el layout;
- retrasar una acción para que termine una animación;
- animar simultáneamente grandes regiones sin una razón funcional.

Todos los patrones deben respetar `prefers-reduced-motion`. En ese modo se eliminan desplazamientos y escalas no esenciales, conservando cambios de estado instantáneos o mediante opacidad mínima.

No se incorporará una biblioteca de animación mientras CSS y las primitivas ya usadas sean suficientes.

## Estados obligatorios de los componentes

Todo componente interactivo debe diseñarse y probarse en los estados que le apliquen:

```text
default
hover
focus-visible
active / pressed
selected
disabled
loading
error
success
```

El foco debe ser claramente visible. `disabled` debe comunicar indisponibilidad sin volver ilegible la etiqueta. `loading` no debe confundirse con `disabled`: incluye un indicador y texto de progreso cuando la acción no sea obvia.

## Operaciones asíncronas y loading

Cada espera debe mostrar un estado proporcional al alcance de la operación.

### Acción local

Al guardar, eliminar, buscar o recalcular:

- cambiar el botón a un spinner más un verbo en progreso: `Guardando…`, `Buscando…`;
- impedir envíos duplicados de esa acción;
- mantener disponibles las acciones no relacionadas cuando sea seguro;
- conservar el ancho del botón para evitar saltos visuales.

### Carga de página o bloque

- usar `Skeleton` con una forma cercana al contenido esperado;
- evitar un spinner centrado que reemplace una pantalla completa si ya existe contenido útil;
- durante una actualización, conservar la información anterior y marcar solo el bloque que se está refrescando;
- usar `Progress` únicamente cuando exista progreso medible o etapas claras.

### Espera prolongada

Si la operación excede aproximadamente 8–10 segundos:

- explicar que sigue en proceso;
- ofrecer `Reintentar` o `Cancelar` cuando sea técnicamente seguro;
- no prometer un tiempo que el sistema no puede garantizar.

### Resultado

- éxito breve: toast y actualización visible del contenido;
- éxito que cambia el contexto: confirmación dentro de la nueva vista;
- error: conservar datos capturados y ofrecer una recuperación concreta;
- actualizaciones optimistas: solo para acciones seguras, reversibles y con rollback comprensible.

Los mensajes de espera, éxito y error que no mueven el foco deben anunciarse a tecnologías de asistencia mediante `aria-live` o roles apropiados.

## Errores normalizados e interpretados

La infraestructura registra el detalle técnico de forma segura; la interfaz recibe o construye un error presentable. El usuario nunca ve `400`, `404`, `500`, `501`, SQL, stack traces, nombres internos ni respuestas crudas.

Modelo conceptual:

```ts
type UiErrorKind =
  | "validation"
  | "not-found"
  | "conflict"
  | "temporary"
  | "permission"
  | "unexpected"
  | "critical";

type UiError = {
  kind: UiErrorKind;
  title: string;
  message: string;
  action?: {
    label: string;
    intent: "retry" | "reload" | "back" | "support";
  };
  fieldErrors?: Record<string, string>;
  incidentId?: string;
};
```

Es un contrato de UX; la representación final puede adaptarse a los límites de arquitectura definidos.

### Matriz de mensajes

| Tipo | Mensaje orientativo | Recuperación |
|---|---|---|
| Validación | `Revisa los campos señalados.` | Marcar cada campo y llevar el foco al primer error. |
| No encontrado | `Ya no encontramos esta información. Actualiza la página o vuelve al listado.` | `Actualizar` o `Volver`. |
| Conflicto | `La información cambió mientras la editabas.` | `Recargar información`; conservar una copia local si es posible. |
| Red o temporal | `No pudimos completar la acción. Revisa tu conexión y vuelve a intentarlo.` | `Reintentar`. |
| Permiso | `No tienes acceso para realizar esta acción.` | Volver a un lugar seguro o solicitar acceso cuando exista ese proceso. |
| Inesperado | `Algo salió mal. Inténtalo de nuevo. Si continúa, contacta a soporte.` | `Reintentar` y después `Contactar a soporte`. |
| Crítico | `No continúes con esta operación. Contacta a soporte inmediatamente.` | Bloquear solo la operación afectada y mostrar el canal de soporte. |

`Crítico` se reserva para riesgo de integridad, duplicación monetaria, seguridad o pérdida de datos. No debe usarse para aumentar artificialmente la urgencia.

### Presentación

- error de campo: debajo del control y asociado mediante atributos accesibles;
- error de formulario: `Alert` al inicio del grupo y errores junto a sus campos;
- error transitorio de una acción secundaria: toast con recuperación;
- error de página: estado dedicado con explicación, reintento y navegación segura;
- fallo de una acción destructiva: permanecer en el diálogo y no cerrarlo como si hubiera funcionado;
- error inesperado: puede mostrar un identificador de incidente copiable, nunca el detalle técnico.

La UI no culpa a la persona, no borra lo capturado y no ofrece `Contactar a soporte` si todavía no existe un canal real configurado. Hasta entonces, se muestra `Solicita ayuda al responsable del sistema`. El canal de soporte es una pregunta abierta de producto.

## Formularios y captura rápida

- usar etiquetas visibles; el placeholder es un ejemplo, no reemplaza la etiqueta;
- indicar campos obligatorios de forma consistente;
- presentar valores predeterminados seguros;
- calcular importes sugeridos sin pedir aritmética a la persona;
- permitir que la persona confirme o cambie el precio cobrado y el reparto final;
- mostrar juntos, pero visualmente diferenciados, los valores sugeridos y los finales antes de guardar;
- solicitar un motivo cuando el precio o reparto final difiera de la sugerencia, sin convertir el flujo normal en una tarea pesada;
- agrupar por intención, no por la forma de la tabla de base de datos;
- revelar opciones infrecuentes de manera progresiva;
- seleccionar automáticamente un elemento de catálogo creado durante la captura;
- conservar datos ante validaciones, fallos temporales o cierre accidental prevenible;
- colocar la acción principal al final de la lectura y mantenerla accesible en móvil cuando el formulario sea largo;
- no pedir confirmación para acciones fácilmente reversibles;
- confirmar eliminaciones o consecuencias materiales con `Alert Dialog`.

El registro de visita y servicios debe tender a tres bloques comprensibles:

```text
Atención
  fecha/hora, colaboradora, origen de la clienta

Servicios
  servicios realizados, importes, duración

Pago y resumen
  método, receptor, venta bruta, salón, colaboradora
```

La agrupación definitiva depende de los criterios de `OPS-001`, pero debe preservar el recorrido corto.

## Patrones por tipo de pantalla

### Login

- tarjeta centrada, sencilla y responsive;
- nombre funcional `Beauty Business` y el slot de marca preparado, sin inventar un logotipo;
- campo de cuenta y campo de contraseña con etiquetas visibles e iconos consistentes;
- control accesible para mostrar u ocultar la contraseña;
- acción principal `Iniciar sesión` y estado `Iniciando sesión…`;
- mensaje genérico cuando las credenciales no son válidas;
- mensaje normalizado cuando existen demasiados intentos y debe esperarse;
- sin enlace de registro o recuperación mientras esas capacidades no existan;
- retorno al destino solicitado después de entrar, siempre que sea una ruta interna segura;
- no revelar si una cuenta concreta existe.

El menú de usuario dentro de la aplicación identifica la cuenta activa y ofrece `Cerrar sesión` con icono. Una sesión expirada conduce al login sin mostrar datos protegidos y explica que es necesario volver a entrar.

### Shell de aplicación

- slot de marca opcional;
- navegación con iconos y etiquetas;
- título y contexto de la vista;
- área de contenido;
- zona consistente para ayuda, perfil o configuración cuando esas capacidades entren al alcance.

### Inicio

- acciones frecuentes primero;
- resumen operativo breve, no un dashboard analítico complejo;
- estado vacío que explique cómo comenzar;
- indicadores con etiqueta, periodo y unidad claros.

### Registrar operación

- una tarea principal por vista;
- progreso o secciones si el formulario crece;
- resumen económico visible antes de confirmar, distinguiendo `Sugerencia del sistema` y `Decisión final`;
- importes finales editables mediante una acción explícita como `Ajustar precio o reparto`;
- motivo obligatorio y ayuda contextual cuando exista una diferencia;
- alta contextual de catálogos sin perder el formulario;
- feedback inmediato al guardar.

### Catálogos

- búsqueda visible;
- listado paginado mediante cursor con acción `Siguiente` y retorno mediante historial local de cursores;
- sin números de página o total ficticio cuando el backend no calcula un total exacto;
- botón `Agregar` con icono;
- estado activo/inactivo legible;
- edición en página, diálogo o drawer según complejidad;
- desactivar antes que eliminar cuando existan referencias históricas.

### Autocomplete de servicios

- `Combobox` con icono de búsqueda, etiqueta visible y ayuda contextual;
- resultados remotos por nombre o categoría;
- debounce breve para evitar solicitudes por cada pulsación inmediata;
- spinner dentro de la lista durante búsqueda o carga adicional;
- resultados anteriores permanecen visibles mientras se solicita la siguiente página;
- `Cargar más` es una acción accesible y no depende únicamente de llegar visualmente al final del scroll;
- estado vacío con `No encontramos servicios` y acción `Agregar servicio`;
- cada opción muestra nombre, categoría y precio de lista cuando ayude a distinguirla;
- servicios inactivos se identifican en administración y se ocultan durante una captura nueva;
- la selección se conserva por identificador aunque cambie la búsqueda;
- respuestas tardías no reemplazan la búsqueda actual;
- después de crear un servicio, el combobox vuelve a la visita con ese servicio seleccionado;
- teclado, touch y lector de pantalla pueden abrir, buscar, recorrer, cargar más, seleccionar y cerrar.

### Insights

- filtros de periodo visibles y fáciles de restablecer;
- accesos rápidos para día, semana, mes, año, últimos 30 días y rango personalizado;
- barra de filtros global sticky cuando ayude a conservar contexto;
- totales con términos económicos completos;
- tarjetas con icono `Info`, fórmula, unidad y periodo;
- gráficas solo cuando respondan una pregunta o faciliten una comparación;
- colores de series mediante tokens `chart-*`, con leyendas y etiquetas; el rosa identifica la serie principal, no todos los datos;
- animación breve al cargar o cambiar filtros, sin interpolaciones que oculten el nuevo valor;
- drill-down mediante click, touch o teclado hasta una tabla o lista de registros;
- comparación contra el periodo anterior claramente diferenciada del valor actual;
- tabla o detalle accesible equivalente a cada visualización;
- estados de carga, sin datos y error independientes por bloque;
- fecha de última actualización visible;
- en móvil, tarjetas en una columna y gráficas con altura legible sin desplazar horizontalmente toda la página.

## Microcopy

- español claro y directo;
- botones con verbo: `Guardar visita`, `Registrar gasto`, `Reintentar`;
- evitar `Aceptar` cuando pueda nombrarse el resultado;
- títulos y etiquetas en `sentence case`;
- mensajes de éxito específicos: `La visita quedó registrada`;
- mensajes de error con acción concreta;
- explicar siglas la primera vez; evitar lenguaje interno;
- distinguir siempre `venta bruta`, `ingreso del salón` y `monto de la colaboradora`.

## Accesibilidad

Objetivo: WCAG 2.2 nivel AA para los flujos operativos.

Como mínimo:

- navegación completa con teclado;
- orden de foco coherente;
- foco visible y con contraste suficiente;
- etiquetas, nombres y descripciones accesibles;
- área táctil mínima de 44 × 44 px;
- contraste verificado en texto, iconos funcionales, bordes y estados;
- no comunicar información únicamente mediante color, posición o animación;
- estados asíncronos anunciados sin mover el foco innecesariamente;
- foco inicial y restauración de foco correctos en diálogos y drawers;
- zoom y reflow sin pérdida de contenido o funcionalidad;
- respeto a `prefers-reduced-motion`;
- mensajes de error vinculados a sus campos;
- iconos decorativos ocultos a tecnologías de asistencia.

## Criterios de aceptación de cualquier UI

Antes de considerar terminada una pantalla o componente:

1. Usa componentes basados en shadcn/ui o justifica un componente propio reutilizable.
2. Consume tokens semánticos; no replica valores visuales literales.
3. Tiene iconos coherentes en acciones, menús y navegación donde aportan reconocimiento.
4. Las preguntas tienen ayuda contextual accesible mediante `Info`.
5. Cubre los estados aplicables: hover, foco, presión, selección, disabled, loading, error y éxito.
6. Las transiciones son sutiles y respetan movimiento reducido.
7. Toda operación asíncrona comunica espera y evita duplicados.
8. Los errores son interpretados, recuperables y no exponen detalles técnicos.
9. Funciona en móvil, tableta y escritorio según la tarea.
10. Es usable con teclado y lector de pantalla.
11. Mantiene contraste WCAG 2.2 AA.
12. Conserva los datos del usuario ante fallos recuperables.
13. No inventa logotipo, marca o recursos visuales no aprobados.
14. Incluye pruebas proporcionales para interacción, accesibilidad y estados críticos.

## Fuera de alcance inicial

- creación de logotipo o identidad de marca completa;
- modo oscuro;
- sitio público de marketing;
- ilustraciones personalizadas;
- animaciones complejas o decorativas;
- biblioteca de componentes separada del producto;
- personalización de tema por usuario;
- dashboards de inteligencia de negocio avanzados.

## Preguntas abiertas

- Nombre comercial y activos finales de marca.
- Canal real de soporte y horario de atención.
- Necesidad futura de modo oscuro.
- Validación de la paleta con personas usuarias y dispositivos reales.
- Destinos definitivos de la navegación inferior móvil después de probar la primera vertical.

## Referencias de implementación

- [Theming de shadcn/ui](https://ui.shadcn.com/docs/theming): variables y tokens semánticos.
- [Componentes de shadcn/ui](https://ui.shadcn.com/docs/components): primitivas disponibles.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): criterios de accesibilidad.
- [Mensajes de estado accesibles](https://www.w3.org/WAI/WCAG22/Understanding/status-messages): comunicación de carga, resultado y error a tecnologías de asistencia.
