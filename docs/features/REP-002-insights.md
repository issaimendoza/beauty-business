# REP-002 — Insights operativos

## Objetivo

Ofrecer una sección protegida de análisis visual donde las dos personas autorizadas puedan revisar ingresos, egresos, pagos, actividad, demanda y calidad de captura para cualquier periodo, sin convertir indicadores preliminares en contabilidad formal.

## Historia

Como socia o analista, quiero explorar gráficas y detalles por día, semana, mes o rango de fechas para entender qué ocurrió, detectar variaciones y decidir qué investigar.

## Relación con REP-001

`REP-001` entrega el resumen y valida las fórmulas fundamentales. `REP-002` reutiliza exactamente esas definiciones, añade filtros multidimensionales, comparación, gráficas y navegación hasta los registros fuente.

No debe existir una fórmula para la tarjeta y otra distinta para la gráfica.

## Entrada y navegación

- Destino principal `Insights` en la navegación.
- Acceso protegido por `FND-002`.
- Periodo predeterminado: mes calendario actual.
- La selección se conserva en la URL para recargar, volver y compartir una vista entre las dos cuentas sin incluir datos sensibles en los parámetros.

## Filtros globales

### Periodo

- Día: fecha seleccionada.
- Semana: semana que contiene la fecha seleccionada.
- Mes: mes calendario seleccionado.
- Año: año calendario seleccionado.
- Rango personalizado: fecha inicial y final inclusivas.
- Accesos rápidos: `Hoy`, `Esta semana`, `Este mes`, `Últimos 30 días` y `Este año`.
- Comparación opcional contra el periodo inmediatamente anterior de la misma duración.
- Granularidad diaria, semanal o mensual seleccionada automáticamente según el rango, con ajuste manual cuando sea útil.

Los límites se interpretan en la zona horaria configurada del negocio. La UI muestra siempre el periodo exacto aplicado; no depende solo de palabras como «hoy» o «este mes».

### Dimensiones

Cuando existan datos suficientes:

- colaborador;
- servicio y categoría de servicio;
- método de pago;
- receptor inicial del pago;
- origen de la demanda;
- tipo de cliente;
- categoría de gasto;
- producto y proveedor;
- motivo de oportunidad perdida;
- motivo de ajuste de precio o reparto.

Los filtros se combinan, muestran chips activos y ofrecen `Limpiar filtros`. Una dimensión no aplicable a una gráfica debe indicarlo, no ignorarse silenciosamente.

## Resumen del periodo

Tarjetas iniciales:

- venta bruta;
- ingreso del salón;
- monto de colaboradores;
- egresos registrados;
- resultado operativo preliminar;
- visitas;
- servicios realizados;
- ticket promedio por visita;
- oportunidades perdidas.

Cada tarjeta incluye:

- icono y nombre completo;
- importe, conteo, porcentaje o duración con su unidad;
- icono `Info` con definición y fórmula;
- variación contra el periodo comparado cuando se active la comparación;
- acceso al detalle de los registros que componen el valor.

## Bloques de análisis

### 1. Ingresos, egresos y resultado

- Serie temporal de venta bruta, ingreso del salón y egresos.
- Barras por día, semana o mes según la amplitud del periodo.
- Comparación entre ingreso del salón y egresos registrados.
- Resultado operativo preliminar a lo largo del periodo.
- Distribución de gastos por categoría.
- Compras frente a otros gastos operativos.

`Resultado operativo preliminar` se presenta con una advertencia accesible: no equivale a utilidad contable o fiscal.

### 2. Pagos y flujo de dinero

- Venta bruta por método de pago.
- Importe recibido inicialmente por el salón frente al recibido por colaboradores.
- Tendencia de pagos dentro del periodo.
- Cruce entre método y receptor del pago.

La interfaz explica que **receptor del pago no equivale a propietario económico del dinero**. Un colaborador puede recibir el pago y aun así existir una parte correspondiente al salón, o viceversa.

Mientras pagos parciales, propinas, reembolsos y liquidaciones posteriores estén fuera de alcance, las gráficas deben declarar que representan los pagos registrados en servicios realizados, no una conciliación bancaria.

### 3. Servicios y actividad

- Visitas y servicios por día.
- Servicios más realizados por cantidad y venta bruta.
- Ingreso del salón y monto de colaboradores por servicio.
- Actividad por colaborador.
- Ticket promedio por visita.
- Duración promedio por servicio.
- Distribución por día de la semana y hora mediante mapa de calor cuando existan suficientes datos.
- Tipo de cliente: nuevo, recurrente o desconocido.

### 4. Precios, descuentos y repartos

- Importe de descuentos y cargos adicionales.
- Frecuencia y monto por motivo de ajuste de precio.
- Diferencia entre precio de lista e importe final.
- Cantidad e importe de repartos modificados manualmente.
- Motivos de ajuste de reparto.
- Comparación entre sugerencia del sistema y decisión final.

La gráfica no debe presentar como anomalía automática una decisión manual: muestra la diferencia y su motivo para que la persona la interprete.

### 5. Demanda y oportunidades perdidas

- Demanda originada por el salón, colaboradores o desconocida.
- Oportunidades perdidas por motivo.
- Servicios solicitados que no se concretaron.
- Día y horario solicitado cuando se conozcan.
- Canal de contacto y tipo de cliente cuando existan.
- Relación descriptiva entre demanda atendida y perdida, sin afirmar una tasa de conversión cuando los universos no sean comparables.

### 6. Calidad y conciliación

Cuando `OPS-003` esté disponible:

- días cerrados frente a pendientes;
- diferencias encontradas en el cierre;
- registros corregidos o anulados cuando exista esa capacidad;
- datos desconocidos o incompletos que afecten un indicador.

Este bloque debe ayudar a evaluar la confiabilidad del periodo antes de interpretar sus números.

## Visualizaciones

Se usarán únicamente visualizaciones que respondan una pregunta concreta:

| Pregunta | Visualización preferida |
|---|---|
| ¿Cómo cambió en el tiempo? | Línea o área. |
| ¿Cómo se comparan categorías? | Barras horizontales o verticales. |
| ¿Cómo se compone un total? | Barra apilada; dona solo con pocas categorías. |
| ¿Cuándo existe mayor actividad? | Mapa de calor por día y hora. |
| ¿Qué registros forman el total? | Tabla o lista detallada. |

No usar gráficas 3D, escalas truncadas engañosas, exceso de categorías, animaciones decorativas o colores sin leyenda.

## Detalle y trazabilidad

- Al activar una tarjeta, punto, barra o segmento se abre el detalle filtrado correspondiente.
- El detalle muestra registros fuente paginados con fecha, concepto, importes y dimensiones relevantes.
- Volver desde el detalle conserva filtros, scroll y periodo.
- Los totales del detalle deben reconciliar con la selección visual, salvo redondeos explícitamente explicados.
- Las filas enlazan a la lectura del registro cuando esa pantalla exista.
- No se muestran notas libres o datos innecesarios en tooltips o vistas agregadas.

## Estados

- Carga inicial mediante skeletons con la forma aproximada de tarjetas y gráficas.
- Cambio de filtros mantiene los datos anteriores de forma atenuada mientras llega el resultado nuevo.
- Cada bloque puede fallar o estar vacío sin inutilizar toda la página.
- `Sin datos` se distingue de un valor real igual a cero.
- Una fuente todavía no implementada aparece como `Disponible después de registrar…`, no como una gráfica vacía engañosa.
- Se muestra la fecha y hora de la última actualización exitosa.

## Accesibilidad

- Cada gráfica utiliza la capa accesible de la librería seleccionada cuando exista.
- Toda visualización tiene título, descripción, unidades, leyenda y periodo.
- El color nunca es el único diferenciador; se usan etiquetas, patrones o iconos cuando sea necesario.
- Tooltips están disponibles mediante teclado y touch, no solo hover.
- Cada gráfica ofrece una tabla o lista equivalente accesible.
- La lectura principal sigue siendo comprensible con movimiento reducido y sin animación.
- En móvil, las gráficas no fuerzan scroll horizontal de toda la página y el detalle se adapta a tarjetas.

## Definiciones económicas

```text
venta_bruta = suma de importes finales cobrados por servicios
ingreso_salon = suma de importes finales correspondientes al salón
monto_colaboradores = suma de importes finales correspondientes a colaboradores
egresos_registrados = suma de gastos y compras dentro del periodo
resultado_operativo_preliminar = ingreso_salon - egresos_registrados
ticket_promedio = venta_bruta / número de visitas con venta
```

El resultado operativo preliminar:

- no incluye conceptos que todavía no se registren;
- no calcula impuestos;
- no aplica reglas contables de devengo;
- no sustituye utilidad, flujo de caja ni saldo bancario;
- no debe llamarse `ganancia`, `utilidad` o `beneficio neto`.

## Criterios de aceptación

1. `Insights` aparece como destino protegido de navegación.
2. El periodo predeterminado es el mes actual y puede cambiarse a día, semana, mes, año, últimos 30 días o rango personalizado.
3. La UI muestra las fechas exactas y usa la zona horaria configurada del negocio.
4. Los filtros globales se aplican de forma coherente a tarjetas, gráficas y detalle.
5. El usuario puede combinar y limpiar filtros multidimensionales.
6. Existe comparación opcional con el periodo anterior equivalente.
7. Ventas brutas, ingreso del salón, monto de colaboradores, pagos recibidos y egresos nunca se mezclan bajo una misma etiqueta ambigua.
8. El resultado operativo preliminar incluye su fórmula y advertencia de que no es utilidad contable.
9. Cada indicador y gráfica puede rastrearse hasta los registros que lo componen.
10. El total del detalle reconcilia con el indicador seleccionado.
11. Los cambios manuales de precio y reparto se analizan junto con sus motivos.
12. Las gráficas de pagos distinguen método, receptor y propiedad económica.
13. Estados sin datos no presentan ceros engañosos.
14. Una falla parcial no elimina los demás bloques disponibles.
15. Las gráficas son responsivas y utilizables con mouse, touch, teclado y lector de pantalla.
16. Cada gráfica tiene alternativa tabular accesible.
17. El filtro activo se conserva al abrir detalle, volver o recargar.
18. Los cálculos usan snapshots históricos y nunca acuerdos o precios actuales.
19. Las fórmulas y filtros tienen pruebas con conjuntos de datos conocidos, límites de periodo y zona horaria.
20. Las consultas mantienen un tiempo de respuesta aceptable con el volumen esperado de la etapa; optimizaciones se basan en medición.

## Fuera de alcance

- Contabilidad formal o fiscal.
- Conciliación bancaria.
- Utilidad neta certificada.
- Pronósticos o predicción de demanda.
- Recomendaciones automáticas.
- Metas, presupuestos y alertas.
- Constructor libre de reportes.
- Exportaciones contables.
- Integración con bancos o terminales de pago.
- Datos en tiempo real mediante streaming.

## Preguntas abiertas

- Zona horaria definitiva del negocio.
- Periodo inicial de comparación que resulte más útil después del primer mes de datos.
- Umbral mínimo de datos para mostrar mapas de calor y porcentajes sin inducir conclusiones débiles.

## Done when

- Las dos cuentas pueden explorar un periodo completo desde el resumen hasta los registros fuente.
- Ingresos, egresos, pagos, actividad, ajustes y demanda tienen al menos una vista útil cuando sus fuentes existen.
- Las definiciones coinciden con `DOMAIN.md` y `REP-001`.
- Las pruebas verifican filtros, fórmulas, comparación, drill-down y accesibilidad crítica.
- Los checks del repositorio pasan.

## Referencia de implementación visual

- [Chart de shadcn/ui](https://ui.shadcn.com/docs/components/radix/chart): composición, tooltips, leyendas y capa de accesibilidad. La versión concreta debe verificarse al implementar.
