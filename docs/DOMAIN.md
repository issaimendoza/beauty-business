# Dominio

## Mapa conceptual

```text
Cliente
  └── Visita
        └── Servicio realizado
              ├── Servicio de catálogo
              ├── Colaborador
              ├── Acuerdo económico (snapshot)
              └── Reparto económico

Gasto o compra
  ├── Categoría
  ├── Producto (opcional)
  └── Proveedor (opcional)

Oportunidad perdida
  ├── Servicio solicitado
  ├── Motivo
  └── Fecha/hora solicitada
```

## Términos principales

### Visita

Una atención de una clienta dentro del negocio. Puede contener uno o más servicios y no equivale necesariamente a una sola línea de venta.

### Servicio

Definición de catálogo de un trabajo ofrecido, por ejemplo gelish, uñas acrílicas, pestañas clásicas, retiro o peinado. Conserva un precio de lista y una duración estimada actuales.

### Servicio realizado

Evento histórico que declara que un servicio fue prestado durante una visita. Guarda quién lo realizó, cuánto se cobró y cómo se repartió económicamente en ese momento.

El sistema puede proponer el precio y el reparto a partir del catálogo y del acuerdo vigente, pero la propuesta no sustituye la decisión operativa. La persona que registra confirma o modifica los importes finales antes de guardar.

`service_performed` es un nombre más preciso que `sale`, porque un mismo evento representa actividad comercial, ingreso del salón y ganancia del prestador.

### Colaborador o prestador

Persona que realiza servicios. Puede ser propietaria/socia, empleada, colaboradora por comisión, arrendataria de espacio u otro tipo aún por definir.

Puede utilizar herramientas o materiales propios y su permanencia no está garantizada.

### Acuerdo económico

Reglas vigentes entre el salón y un colaborador. Puede incluir tipo de participación, porcentaje para el salón, quién aporta herramientas y quién aporta materiales.

El catálogo contiene el acuerdo actual; cada servicio realizado conserva un snapshot del acuerdo usado para calcularlo.

El acuerdo vigente produce un reparto sugerido. Si las partes acordaron otro reparto para una sesión concreta, la captura puede sustituir la sugerencia, siempre que conserve los importes propuestos, los importes finales y el motivo del ajuste.

### Ventas brutas o GMV

Valor total cobrado por servicios realizados dentro del salón. Mide actividad comercial, no necesariamente ingreso propio del negocio.

```text
final_gross_amount = final_salon_amount + final_provider_amount
```

### Ingreso del salón

Parte de la venta bruta que corresponde económicamente al salón.

### Ganancia o monto del colaborador

Parte de la venta bruta que corresponde a quien realizó el servicio.

### Ejemplo de reparto

```text
Servicio cobrado                 $1,000
Ingreso del salón, 30 %            $300
Monto de la colaboradora, 70 %     $700
```

Las tres cantidades son relevantes y no deben mezclarse bajo la palabra «ingreso».

### Origen de la demanda

Indica quién generó la oportunidad comercial. La clasificación conceptual mínima es:

- `SALON`: demanda atribuible al salón.
- `PROVIDER`: demanda atribuible al colaborador.
- `UNKNOWN`: no existe información suficiente.

La UI puede capturar mayor detalle —recomendación, Instagram, Facebook, Google, walk-in, redes del colaborador— y normalizarlo a esta dimensión estratégica.

Esta distinción permite estimar qué demanda podría conservar el negocio si un colaborador se retira.

### Receptor del pago

Persona o parte que recibió inicialmente el dinero del cliente:

- salón;
- colaborador.

No cambia el reparto económico, pero sí el flujo de caja y la futura conciliación.

### Precio de lista

Precio publicado o esperado para el servicio.

### Importe cobrado

Cantidad que efectivamente pagó el cliente. La diferencia frente al precio de lista permite observar descuentos, promociones y variaciones informales.

El precio de lista funciona como referencia, no como restricción. El importe cobrado puede ser menor o mayor. Cuando difiere, el registro debe explicar por qué mediante un motivo normalizado y una nota opcional o requerida cuando se elija `OTHER`.

### Cálculo sugerido

Propuesta producida por el sistema usando el precio de lista y el acuerdo económico vigente. Incluye el importe sugerido a cobrar y, después de que la persona confirma el importe final, el ingreso sugerido del salón y el monto sugerido del colaborador.

Los cálculos sugeridos reducen trabajo y errores, pero nunca se presentan como importes inmodificables.

### Ajuste de precio

Diferencia entre el precio de lista conservado en la transacción y el importe final cobrado.

Motivos iniciales:

- `PROMOTION`: promoción vigente;
- `NEGOTIATED_PRICE`: precio acordado con la clienta;
- `COURTESY`: cortesía total o parcial;
- `REWORK_OR_COMPLAINT`: corrección, garantía o inconformidad;
- `EXTRA_WORK_OR_MATERIAL`: trabajo, complejidad o material adicional;
- `PACKAGE`: precio perteneciente a un paquete;
- `STAFF_OR_FAMILY`: precio especial para personal o familiares;
- `OTHER`: otro motivo, acompañado de una explicación.

Una diferencia menor a cero representa descuento; una diferencia mayor a cero representa un cargo o ajuste adicional. No se debe llamar «descuento» a ambos casos.

### Ajuste de reparto

Modificación manual del ingreso sugerido del salón o del monto sugerido del colaborador para una sesión concreta.

El ajuste requiere un motivo y debe conservar la igualdad económica del esquema simple:

```text
final_gross_amount = final_salon_amount + final_provider_amount
```

Los importes sugeridos y finales se conservan por separado para poder explicar qué propuso el sistema, qué decidió la operación y por qué.

Motivos iniciales:

- `SESSION_AGREEMENT`: acuerdo especial para esa sesión;
- `MATERIALS_OR_TOOLS`: reparto distinto por quién aportó materiales o herramientas;
- `REWORK_OR_COMPLAINT`: corrección, garantía o inconformidad;
- `CORRECTION`: corrección de un cálculo o captura;
- `OTHER`: otro motivo, acompañado de una explicación.

### Gasto

Evento en el que sale dinero del negocio. Incluye compras de materiales y gastos operativos como renta, servicios, limpieza, publicidad, mantenimiento, personal, transporte u otros.

Todo egreso requiere categoría. Una compra requiere producto y puede conservar cantidad, unidad, costo unitario, proveedor y referencia de comprobante; estos datos describen la compra y no crean existencias de inventario.

No pretende sustituir la contabilidad formal.

### Oportunidad perdida

Demanda que no terminó en un servicio vendido: falta de disponibilidad, precio, cancelación, no-show, falta de respuesta, incompatibilidad de horario u otra razón.

Permite observar demanda que normalmente desaparece del registro.

La fecha de registro y la fecha/hora solicitada son conceptos distintos. Canal, tipo de cliente y origen se conservan por separado para poder agrupar sin confundir contacto con atribución comercial.

### Cierre diario

Control de calidad y conciliación al final del día. Confirma efectivo y detecta ventas o gastos no registrados. No es la fuente primaria de ventas.

### Egresos registrados

Suma de gastos y compras capturados para un periodo. Describe eventos registrados y no garantiza que todos los costos contables o movimientos bancarios estén incluidos.

### Resultado operativo preliminar

Indicador exploratorio calculado como:

```text
resultado_operativo_preliminar = ingreso_del_salon - egresos_registrados
```

No equivale a utilidad, ganancia neta, flujo de caja o saldo bancario. Solo es válido dentro de la cobertura real de captura del periodo.

### Periodo de análisis

Intervalo temporal inclusivo interpretado en la zona horaria configurada del negocio. Puede representar un día, semana, mes o rango personalizado. Toda métrica debe mostrar sus límites exactos.

## Invariantes

1. `final_gross_amount` debe ser igual a `final_salon_amount + final_provider_amount` para repartos simples.
2. Ningún importe monetario usa punto flotante.
3. El acuerdo actual de un colaborador no modifica transacciones históricas.
4. El precio actual de un servicio no modifica el precio de lista guardado en una transacción histórica.
5. Desactivar un catálogo no elimina ni invalida sus referencias anteriores.
6. Una cifra diaria se deriva de eventos individuales.
7. Los timestamps y valores originales se conservan aun cuando exista normalización posterior.
8. Toda corrección futura debe ser rastreable; el mecanismo exacto sigue abierto.
9. El sistema sugiere importes; la persona que registra confirma los importes finales.
10. Toda diferencia entre el precio de lista y el importe final requiere un motivo de ajuste de precio.
11. Toda diferencia entre el reparto sugerido y el reparto final requiere un motivo de ajuste de reparto.

## Snapshot histórico mínimo

Cada servicio realizado debe conservar, como mínimo:

```text
provider_id
service_id
list_amount
suggested_charge_amount
suggested_salon_amount
suggested_provider_amount
final_gross_amount
final_salon_amount
final_provider_amount
agreement_type
commission_rate (cuando aplique)
price_adjustment_reason (cuando exista diferencia)
price_adjustment_note (cuando aplique)
split_adjustment_reason (cuando exista diferencia)
split_adjustment_note (cuando aplique)
performed_at
```

Fecha, tipo de cliente, origen, método y receptor inicial pertenecen a la visita. Los identificadores enlazan catálogos; los valores del momento protegen la historia.

## Perspectivas analíticas

### Financiera

- venta bruta;
- ingreso del salón;
- monto del colaborador;
- gastos;
- resultado operativo preliminar, acompañado de su cobertura y limitaciones.

### Operativa

- visitas;
- servicios;
- clientes por día;
- duración;
- horarios y días con mayor actividad;
- ocupación futura.

### Comercial

- demanda generada por el salón;
- demanda generada por colaboradores;
- nuevos frente a recurrentes;
- descuentos;
- oportunidades perdidas.

## Categorías iniciales de gasto

- Materiales.
- Herramientas y equipo.
- Renta.
- Luz, agua e internet.
- Limpieza.
- Publicidad.
- Mantenimiento.
- Comisiones o sueldos.
- Transporte.
- Otros.

## Entidades futuras, todavía fuera de implementación

El aprendizaje podría justificar después `Customer`, `Appointment`, `Payment`, `MaterialConsumption`, `InventoryItem` y modelos contables más ricos. Su mención no autoriza implementarlos ahora.
