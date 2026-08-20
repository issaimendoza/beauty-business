# FND-001 — Bootstrap mínimo

## Objetivo

Preparar la infraestructura local mínima para implementar y validar la primera vertical sin introducir capacidades operativas del negocio.

## Alcance

- Confirmar la estructura modular objetivo y mover `app/` a `src/app/` si el plan lo aprueba.
- Crear `compose.yaml` para levantar PostgreSQL y cualquier dependencia local aprobada, excluyendo la aplicación Next.js.
- Configurar healthcheck, volumen nombrado y versión explícita de cada imagen.
- Integrar Drizzle ORM y Drizzle Kit.
- Integrar Zod.
- Configurar Vitest y la estrategia de pruebas de integración.
- Agregar scripts de generación y aplicación de migraciones.
- Agregar scripts explícitos de type-check y test.
- Inicializar el tema claro basado en tokens semánticos de shadcn/ui conforme a `DESIGN.md`.
- Inicializar solo los componentes de UI necesarios para la siguiente vertical, incluido el patrón compartido de ayuda contextual.
- Preparar los patrones base de loading, notificaciones y errores interpretados sin implementar comportamiento de negocio.
- Verificar lint, tipos, pruebas y build.

## Fuera de alcance

- Entidades completas del negocio.
- Autenticación y autorización.
- CI.
- Despliegue cloud.
- Servicios administrados.
- Observabilidad productiva.
- API separada.

## Criterios de aceptación

1. Un desarrollador puede levantar todas las dependencias locales con `docker compose up -d` siguiendo el README.
2. El Compose no construye ni ejecuta la aplicación Next.js.
3. PostgreSQL informa un estado saludable antes de utilizarse y conserva datos entre reinicios normales.
4. La aplicación ejecutada en el host puede conectarse a PostgreSQL usando configuración local no versionada.
5. Existe una migración mínima de comprobación o una estrategia aprobada para que la primera migración funcional pertenezca a `FND-002`.
6. Existen comandos para generar y aplicar migraciones.
7. Existen comandos para lint, type-check, pruebas y build.
8. Al menos una prueba unitaria y una de integración demuestran que el harness funciona.
9. El tema expone tokens semánticos para la paleta rosa/clara y no repite colores literales como contrato de los componentes.
10. Existe una base accesible para iconos, ayuda contextual, loading y mensajes normalizados conforme a `DESIGN.md`.
11. La arquitectura real coincide con `ARCHITECTURE.md` o la documentación se actualiza mediante una decisión explícita.

## Done when

- El entorno puede reconstruirse desde cero siguiendo el README.
- Todos los checks pasan.
- No se implementó comportamiento de negocio adelantado.
- El plan de `FND-002` puede comenzar sin trabajo fundacional oculto.
