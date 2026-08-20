# OPS-001 — Registrar visita y servicios

## Objetivo

Capturar la primera vertical real del negocio y conservar actividad comercial, reparto económico, duración y origen de demanda.

## Historia

Como Andrea, quiero registrar una visita terminada para medir lo que ocurrió sin hacer cálculos manuales.

El sistema facilita la captura con cálculos sugeridos, pero Andrea conserva la decisión sobre el precio cobrado y el reparto final acordado para esa sesión.

## Alcance

Una visita puede contener uno o más servicios. Cada servicio realizado identifica su servicio de catálogo, prestador e importes históricos.

### Datos capturados

- Fecha y hora de la visita.
- Hora inicial y final.
- Tipo de cliente: nuevo, recurrente o desconocido.
- Origen de demanda: salón, colaborador o desconocido; detalle opcional.
- Uno o más servicios realizados.
- Prestador de cada servicio.
- Importe final cobrado de cada servicio.
- Motivo de ajuste cuando el importe final difiere del precio de lista.
- Importes finales del salón y del prestador cuando se modifica el reparto sugerido.
- Motivo del ajuste cuando el reparto final difiere del sugerido.
- Método de pago.
- Receptor inicial del pago: salón o colaborador.
- Observaciones opcionales.

### Datos derivados o copiados como snapshot

- Precio de lista.
- Tipo y porcentaje del acuerdo.
- Importe sugerido a cobrar.
- Ingreso sugerido del salón.
- Monto sugerido del colaborador.
- Venta bruta final.
- Ingreso final del salón.
- Monto final del colaborador.
- Duración.
- Diferencia, descuento o cargo adicional.

## Criterios de aceptación

1. Andrea puede registrar una visita con al menos un servicio.
2. Cada servicio requiere un prestador activo y un servicio activo.
3. El sistema propone primero el importe a cobrar usando el precio de lista.
4. Después de confirmar el importe final, el sistema propone su reparto usando el acuerdo vigente para esa transacción.
5. Andrea puede aceptar las propuestas o modificar el importe cobrado y los montos finales del reparto antes de guardar.
6. La interfaz muestra claramente los importes sugeridos y los finales antes de confirmar.
7. Si el importe final difiere del precio de lista, se requiere un motivo normalizado; `Otro` requiere una explicación.
8. Si el reparto final difiere del sugerido, se requiere un motivo; no basta con cambiar silenciosamente los montos.
9. `final gross amount = final salon amount + final provider amount` bajo el esquema simple, incluso cuando el reparto fue modificado.
10. Modificar posteriormente el colaborador, su acuerdo o el servicio no altera los valores sugeridos, finales ni motivos del snapshot.
11. Hora final no puede ser anterior a hora inicial, salvo una regla futura explícita para cruces de día.
12. El origen de demanda admite salón, colaborador o desconocido.
13. El método y receptor de pago quedan registrados.
14. Una visita puede incluir más de un servicio sin duplicar los datos comunes.
15. El flujo frecuente prioriza uso móvil, calcula la propuesta automáticamente y evita pedir cálculos al usuario.
16. Andrea puede crear un servicio faltante desde el flujo y continuar sin perder datos.
17. Errores de validación conservan lo ya capturado y explican cómo corregirlo.
18. La selección de servicio usa el autocomplete remoto y la paginación por cursor definidos en `CAT-002`.
19. Cargar más servicios o cambiar la búsqueda no elimina servicios ya seleccionados en la visita.

## Ejemplo

```text
Visita
  Cliente: recurrente
  Origen: salón
  Inicio: 14:10
  Fin: 15:20

  Servicio: uñas acrílicas
  Prestadora: Daniela
  Precio sugerido (lista): $650
  Cobrado: $600
  Motivo del descuento: promoción
  Comisión salón: 30 %

Sugerencia del sistema
  Ingreso salón: $180
  Monto Daniela: $420

Decisión final de la sesión
  Venta bruta: $600
  Ingreso salón: $200
  Monto Daniela: $400
  Motivo del ajuste: acuerdo especial de esta sesión
  Duración: 70 min
  Descuento: $50
```

## Fuera de alcance

- Identidad personal completa de la clienta.
- Agenda previa.
- Cobros parciales, propinas, devoluciones y reembolsos hasta definir reglas.
- Conciliación o pago posterior al colaborador.
- Consumo de materiales por servicio.

## Preguntas abiertas

- ¿Cómo se modelan propinas?
- ¿Se permite editar, anular o corregir una visita cerrada?

La V1 confirma servicios de varios prestadores dentro de una visita. Método y receptor inicial son datos comunes de la visita; prestador y reparto se conservan por línea.

## Done when

- La vertical atraviesa UI, caso de uso, dominio, persistencia y lectura de confirmación.
- Existen pruebas del cálculo, snapshot y validaciones.
- Los checks del repositorio pasan.
- La documentación refleja cualquier regla confirmada durante la implementación.
