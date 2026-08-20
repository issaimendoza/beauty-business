# CAT-002 — Servicios

## Objetivo

Mantener el catálogo de trabajos ofrecidos para reducir captura manual y comparar precio de lista, precio real y duración.

## Historia

Como Andrea, quiero administrar servicios para seleccionarlos rápidamente al registrar una atención y agregar uno nuevo sin abandonar el flujo.

## Datos iniciales

- Nombre.
- Categoría, por ejemplo uñas, pestañas o cabello.
- Precio de lista vigente.
- Duración estimada en minutos.
- Estado activo/inactivo.
- Descripción opcional.

## Consulta del catálogo

El catálogo no carga todos los servicios en el navegador. Usa paginación keyset con un cursor opaco y orden estable.

Contrato conceptual:

```ts
type ListServicesQuery = {
  search?: string;
  categoryId?: string;
  status?: "active" | "inactive" | "all";
  after?: string;
  limit?: number;
};

type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
};
```

Reglas:

- tamaño predeterminado: 20 servicios;
- tamaño máximo: 50 servicios;
- orden predeterminado: nombre normalizado ascendente y `id` como desempate único;
- el cursor representa la última clave de ordenamiento, la versión del orden y una huella de la consulta normalizada; no representa un número de página;
- el cursor es opaco para el cliente, se valida en el servidor y nunca se concatena como SQL;
- cambiar búsqueda, categoría, estado u orden reinicia la paginación;
- el listado administrativo permite navegar hacia adelante y volver usando el historial de cursores de la UI;
- no se calcula un total exacto en cada consulta salvo que una necesidad real lo justifique;
- al combinar páginas, la UI elimina duplicados por `id` y una actualización explícita reinicia desde el principio;
- ediciones concurrentes pueden cambiar la posición de un servicio entre solicitudes; no se promete un snapshot congelado de todo el catálogo.

La persistencia implementa keyset pagination. No se usa `OFFSET` para recorrer el catálogo de servicios.

## Autocomplete

La selección de servicio en `OPS-001` utiliza un `Combobox` con búsqueda remota:

- busca por nombre y categoría sin distinguir mayúsculas, minúsculas o acentos cuando la estrategia de PostgreSQL lo permita;
- muestra únicamente servicios activos en la captura operativa;
- el catálogo administrativo puede incluir activos, inactivos o todos;
- ejecuta la búsqueda con un debounce breve, inicialmente 250–300 ms;
- cancela la solicitud anterior o ignora su respuesta si ya existe una búsqueda más reciente;
- muestra loading dentro de la lista sin bloquear el resto del formulario;
- carga la primera página y permite solicitar más resultados con `Cargar más` o scroll incremental accesible;
- conserva la selección por `id`, aunque el elemento seleccionado no pertenezca a la página visible;
- permite limpiar la selección;
- muestra `No encontramos servicios` cuando no existen coincidencias;
- ofrece `Agregar servicio` con el texto buscado como valor inicial cuando no existe una opción adecuada;
- después del alta contextual, incorpora y selecciona el servicio nuevo sin reiniciar la visita.

El autocomplete debe funcionar con teclado, touch y lector de pantalla. Flechas navegan las opciones, `Enter` selecciona y `Escape` cierra sin borrar una selección confirmada.

## Criterios de aceptación

1. Andrea puede crear, consultar, editar y desactivar servicios.
2. Nombre y categoría permiten localizar rápidamente una opción.
3. El precio usa una representación monetaria segura.
4. La duración estimada es positiva cuando se informa.
5. Los servicios inactivos no aparecen por defecto en nuevas capturas.
6. Cambiar precio o duración no modifica transacciones históricas.
7. Desde `OPS-001` se puede abrir un alta breve, guardar y dejar seleccionado el servicio nuevo.
8. El listado usa cursor opaco, orden estable y páginas de tamaño limitado; no utiliza paginación por `OFFSET`.
9. Una página devuelve `nextCursor` solo cuando existen más resultados.
10. Un cursor inválido o incompatible con la consulta produce un error normalizado y permite reiniciar el listado.
11. Cambiar búsqueda, categoría, estado u orden descarta el cursor anterior.
12. La selección operativa ofrece autocomplete remoto por nombre o categoría.
13. El autocomplete no muestra servicios inactivos por defecto.
14. Una respuesta obsoleta nunca reemplaza resultados de una búsqueda más reciente.
15. El usuario puede cargar más coincidencias sin perder las ya mostradas ni la selección.
16. El alta contextual conserva la búsqueda, la visita y selecciona el servicio creado.
17. Paginación, filtros, orden, concurrencia básica y autocomplete tienen pruebas con datos conocidos.
18. Búsqueda, loading, estado vacío, errores y carga adicional son accesibles mediante teclado y lector de pantalla.

## Fuera de alcance

- Paquetes y promociones complejas.
- Recetas de materiales.
- Precios por colaborador.
- Inventario.
- Agenda y disponibilidad.

## Done when

- El catálogo soporta el registro de una atención sin texto libre para servicios conocidos.
- El alta contextual funciona sin perder el formulario en progreso.
- Las reglas y validaciones tienen pruebas.
- El listado y el autocomplete nunca requieren descargar el catálogo completo.

## Referencia de implementación visual

- [Combobox de shadcn/ui](https://ui.shadcn.com/docs/components/aria/combobox): patrón accesible de autocomplete. La variante y API concretas deben confirmarse al implementar.
