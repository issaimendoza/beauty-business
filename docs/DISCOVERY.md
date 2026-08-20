# Descubrimiento inicial del negocio

Este levantamiento ocurre antes o en paralelo al bootstrap técnico. Su propósito es documentar el proceso real, no forzar respuestas para completar un modelo preconcebido.

## Mapa inicial a validar

```text
Cliente contacta
  → solicita fecha o servicio
  → alguien agenda o responde
  → llega al salón
  → recibe uno o más servicios
  → paga al salón o al colaborador
  → se reparte el valor
  → se consumen materiales
  → se reponen mediante compras
```

## Entrevista con Andrea

Realizar una sesión de 1–2 horas y documentar ejemplos reales.

### Llegada y demanda

- ¿Cómo llegan las clientas: WhatsApp, Instagram, Facebook, Google, recomendación o walk-in?
- ¿Cómo se distingue una clienta del salón de una traída por un colaborador?
- ¿Cómo se sabe si una clienta es nueva o recurrente?
- ¿Qué solicitudes se rechazan y por qué?
- ¿Cómo se registran cancelaciones y no-shows hoy?

### Agenda y atención

- ¿Quién agenda y dónde se anotan las citas?
- ¿Qué sucede cuando una clienta pide varios servicios?
- ¿Puede una visita involucrar a varias personas?
- ¿Cómo se conocen las horas de inicio y término?
- ¿Cómo se decide el precio final?

### Cobro y reparto

- ¿Qué medios de pago se aceptan?
- ¿Quién cobra en cada modalidad de colaboración?
- ¿Qué parte corresponde al salón y qué parte al prestador?
- ¿Existen comisiones, renta de espacio, sueldo o acuerdos híbridos?
- ¿Quién aporta herramientas y materiales?
- ¿Con qué frecuencia cambian los acuerdos?

### Gastos y materiales

- ¿Quién compra materiales?
- ¿Cómo saben cuándo reponer?
- ¿Qué proveedores usan con frecuencia?
- ¿Cómo registran gastos actualmente?
- ¿Qué gastos fijos y variables existen?
- ¿Qué inventario aproximado tienen al comenzar?

### Operación y adopción

- ¿Quién será responsable de capturar cada evento?
- ¿En qué dispositivo se capturará?
- ¿En qué momento del flujo existe una pausa natural para registrar?
- ¿Qué campos generarían fricción o abandono?
- ¿Cómo se corregirá un error detectado después?

## Catálogos iniciales a levantar

### Servicios

```text
ID
Categoría
Nombre
Precio de lista
Duración aproximada
Activo
```

### Personal

```text
ID
Nombre
Rol o especialidad
Tipo de participación
Acuerdo económico
Herramientas propias o del salón
Materiales propios o del salón
Activo
```

### Productos e insumos

```text
ID
Nombre
Marca
Presentación
Unidad
Existencia aproximada
Costo aproximado
Proveedor habitual
Activo
```

### Proveedores y gastos

Levantar proveedores frecuentes y validar las categorías iniciales definidas en `DOMAIN.md`.

## Entregables del descubrimiento

- Diagrama del proceso real confirmado.
- Catálogo inicial de servicios.
- Catálogo inicial de personal y acuerdos.
- Inventario aproximado de productos.
- Lista de proveedores.
- Métodos y receptores de pago reales.
- Lista priorizada de dudas y excepciones.
- Confirmación de los campos mínimos de `OPS-001`, `FIN-001` y `OPS-002`.

## Regla

Los ejemplos de esta documentación son hipótesis de trabajo. Cuando el levantamiento revele una diferencia, actualizar primero producto, dominio o especificación antes de codificarla.
