# OPS-002 — Registrar oportunidad perdida

## Objetivo

Conservar demanda que no terminó en una venta para identificar capacidad insuficiente, fricción de precio y otros motivos.

## Historia

Como Andrea, quiero registrar rápidamente una solicitud no concretada para entender cuánta demanda desaparece y por qué.

## Datos

- Fecha del registro.
- Servicio solicitado.
- Motivo.
- Fecha y hora solicitadas, si se conocen.
- Canal: WhatsApp, Instagram, Facebook, llamada, walk-in u otro.
- Cliente nuevo, recurrente o desconocido.
- Origen de demanda, si se conoce.
- Observaciones opcionales.

## Motivos iniciales

- Sin disponibilidad.
- Precio.
- Cliente canceló.
- No-show.
- No respondió.
- Horario incompatible.
- Otro.

La captura distingue la fecha del registro de la fecha solicitada. También conserva canal, tipo de cliente y origen de demanda como dimensiones separadas.

## Criterios de aceptación

1. El registro puede completarse rápidamente sin crear una clienta en un CRM.
2. Servicio y motivo son obligatorios.
3. Fecha y hora solicitadas son opcionales pero analizables cuando existen.
4. El sistema permite agrupar oportunidades por motivo, servicio, día, hora y canal.
5. Los catálogos inactivos conservan referencias históricas.
6. El servicio puede elegirse del catálogo o registrarse como texto cuando todavía no existe.
7. Los motivos normalizados incluyen cancelación y no-show además de disponibilidad, precio, horario y falta de respuesta.

## Fuera de alcance

- Seguimiento comercial o pipeline.
- Recordatorios y recuperación automática.
- Agenda.
- Perfil completo del prospecto.

## Done when

- Se puede cuantificar la demanda no concretada en un periodo.
- Las validaciones y persistencia tienen pruebas.
- El flujo funciona bien en móvil.
