# Alcance

## Alcance de la primera versión operativa

La V1 es una miniaplicación de captura y catálogos, no el sistema completo del salón.

### Acceso

- La aplicación podrá publicarse en una URL accesible desde Internet.
- Solo dos cuentas individuales podrán acceder a páginas, datos y operaciones.
- Ambas cuentas tendrán acceso completo; no habrá roles diferenciados.
- No existirá registro público, invitación ni recuperación de contraseña.
- Todas las rutas y operaciones de negocio estarán protegidas en el servidor; únicamente el login y recursos técnicos explícitamente seguros podrán ser públicos.

### Catálogos

- Personal y colaboradores.
- Acuerdo económico vigente por colaborador.
- Servicios y categorías.
- Productos e insumos.
- Proveedores.
- Categorías de gasto.

Los catálogos deben permitir alta durante un flujo operativo cuando falte una opción, sin obligar a abandonar la captura. Editar y desactivar elementos debe preservar las referencias históricas.

El catálogo de servicios utiliza autocomplete con búsqueda remota y paginación mediante cursor, tanto para evitar descargar listas completas como para mantener una selección rápida durante la captura.

### Operación

1. Registrar una visita con uno o más servicios realizados.
2. Registrar un gasto o compra.
3. Registrar una oportunidad perdida, cancelación o no-show.
4. Agregar después un cierre diario pequeño para controlar calidad y conciliación.

### Cálculos automáticos

- Duración a partir de hora inicial y final.
- Diferencia, descuento o cargo adicional a partir del precio de lista y el importe final cobrado.
- Importe sugerido a cobrar.
- Ingreso sugerido del salón.
- Monto sugerido del colaborador.
- Totales por día, periodo, persona, servicio, origen y método de pago.

Los cálculos económicos son sugerencias editables. La persona que registra confirma el importe cobrado y el reparto final. Toda diferencia frente al precio o reparto sugeridos conserva un motivo para poder explicarla posteriormente.

### Resumen e Insights

- Ventas brutas e ingreso real del salón.
- Monto de colaboradores.
- Visitas, servicios y ticket promedio.
- Distribución por servicio, persona, día y origen de demanda.
- Gastos por categoría.
- Oportunidades perdidas por motivo y horario solicitado.
- Gráficas de tendencia para ventas, ingreso del salón, egresos y resultado operativo preliminar.
- Pagos por método y receptor inicial.
- Descuentos, cargos adicionales y ajustes de reparto por motivo.
- Actividad por día, semana, mes, colaborador, servicio y horario.
- Filtros por día, semana, mes, año, últimos 30 días y rango personalizado.
- Comparación opcional con el periodo anterior.
- Navegación desde cada indicador o gráfica hasta sus registros fuente.

## Información mínima del registro de atención

### Capturada

- Fecha.
- Hora inicial y final.
- Tipo de cliente: nuevo, recurrente o desconocido.
- Origen de la demanda.
- Persona que realizó cada servicio.
- Servicio realizado.
- Importe efectivamente cobrado.
- Motivo cuando el importe difiere del precio de lista.
- Ingreso final del salón y monto final del colaborador cuando se modifica el reparto sugerido.
- Motivo cuando el reparto final difiere del sugerido.
- Método de pago.
- Quién recibió el pago.
- Observaciones opcionales.

### Obtenida de catálogos o calculada

- Precio de lista.
- Tipo de colaborador.
- Esquema y porcentaje vigentes.
- Importe sugerido a cobrar.
- Ingreso sugerido del salón.
- Monto sugerido del colaborador.
- Duración.
- Diferencia, descuento o cargo adicional.

## Información mínima del gasto o compra

- Fecha.
- Tipo: compra de producto o gasto operativo.
- Producto, cuando aplique.
- Cantidad y unidad, cuando aplique.
- Costo unitario y total, cuando aplique.
- Categoría y concepto.
- Proveedor opcional.
- Método de pago.
- Comprobante opcional.
- Observaciones opcionales.

## Información mínima de la oportunidad perdida

- Fecha del registro.
- Servicio solicitado.
- Resultado o motivo.
- Fecha y hora solicitadas, si se conocen.
- Canal de contacto.
- Tipo de cliente.
- Origen de la demanda, si se conoce.

Motivos iniciales: sin disponibilidad, precio, cancelación, no-show, sin respuesta, horario incompatible y otro.

## Fuera de alcance inicial

- Agenda y reservaciones completas.
- Expediente o CRM con nombre, teléfono, correo y cumpleaños.
- POS completo.
- Facturación fiscal.
- Contabilidad formal.
- Nómina.
- Marketing, campañas, fidelización o puntos.
- Inventario avanzado y consumo exacto por servicio.
- Automatizaciones de WhatsApp.
- Predicción de demanda.
- Contabilidad formal, conciliación bancaria o utilidad neta certificada dentro de Insights.
- Constructor libre de reportes, streaming en tiempo real y recomendaciones automáticas.
- Aplicación móvil nativa.
- API pública, webhooks, workers o integraciones externas generales.
- Microservicios, múltiples repositorios o monorepo.
- Autenticación compleja, roles y permisos diferenciados.
- Registro público, recuperación de contraseña, MFA, SSO o acceso social.
- CI, despliegue cloud y operación productiva antes de validar la primera vertical local.

## Suposiciones actuales

- La aplicación comienza con dos usuarios conocidos y de confianza, cada uno con su propia cuenta.
- Andrea es la operadora principal.
- Los acuerdos con colaboradores pueden cambiar con el tiempo.
- Una visita puede contener varios servicios.
- Un colaborador puede aportar a sus propios clientes o atender demanda generada por el salón.
- El pago puede recibirlo el salón o directamente el colaborador.
- La prioridad inicial es calidad y continuidad del dato, no cobertura funcional amplia.

## Decisiones concretadas y preguntas restantes

- Una visita puede contener varios servicios y cada línea puede pertenecer a una colaboradora diferente.
- Método y receptor inicial del pago pertenecen a la visita; los repartos pertenecen a cada servicio realizado.
- La V1 admite efectivo, tarjeta, transferencia y otro; ampliar la lista requiere evidencia operativa.
- El origen estratégico inicial es salón, colaboradora o desconocido.
- El cierre diario forma parte de la primera entrega y puede usarse desde el primer día.
- La renta fija y acuerdos híbridos permanecen fuera del cálculo automático; se usa reparto porcentual o ajuste manual justificado.
- Editar, anular o corregir visitas cerradas sigue fuera de alcance hasta definir autorización y auditoría.
