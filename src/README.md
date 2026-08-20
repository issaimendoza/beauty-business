# Código fuente

La aplicación usa `src/app` para entrega, `src/modules` para dominio, aplicación e infraestructura por capacidad, y `src/shared` para políticas e infraestructura compartidas.

Las dependencias apuntan hacia adentro: UI → aplicación → dominio y puertos; los adaptadores Drizzle se conectan únicamente en `shared/infrastructure/composition`. Consulta `docs/ARCHITECTURE.md`, `docs/CODING_STANDARDS.md` y `.cursor/rules/`.
