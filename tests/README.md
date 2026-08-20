# Pruebas

- `domain/`: reglas puras de dinero, reparto y normalización.
- `application/`: casos de uso, rangos y cursor.
- `components/`: accesibilidad e interacción de componentes.
- `integration/`: migraciones y persistencia PostgreSQL; se activa con `TEST_DATABASE_URL`.
- `scripts/`: validación del bootstrap de cuentas desde variables de entorno.
- `e2e/`: acceso y recorrido integrado de catálogos, operación, finanzas, cierre e Insights.

Vitest usa procesos secuenciales para evitar bloqueos del pool paralelo en Windows con Node.js 24. Playwright usa Chromium y requiere credenciales de una cuenta local aprovisionada.
