# Planes de ejecución

Los cambios complejos se planean antes de implementarse. El plan es un artefacto revisable y versionado, no una autorización para ampliar alcance.

## Flujo

```text
Especificación
  → plan propuesto por el agente
  → revisión y aprobación humana
  → implementación
  → verificación
  → plan marcado como completado
```

## Contenido mínimo

```text
# ID — Plan

## Goal
## Context
## Constraints
## Domain changes
## Database changes
## Application changes
## UI changes
## Tests
## Documentation
## Risks and open questions
## Done when
```

## Métricas de la PoC agéntica

Al cerrar una funcionalidad, registrar:

| Métrica | Descripción |
|---|---|
| Intentos del agente | Ciclos de implementación necesarios |
| Intervenciones humanas | Veces que una persona corrigió dirección |
| Cambios manuales | Ediciones humanas directas al código |
| Pruebas generadas | Pruebas nuevas o actualizadas |
| Bugs en revisión | Defectos descubiertos antes de cerrar |
| Plan aceptado | Si se aprobó sin cambios |
| Feature completada por agente | Si el agente realizó la implementación |

Cuando existan planes, usar `active/` y `completed/`. No crear un plan ficticio solo para llenar la estructura.
