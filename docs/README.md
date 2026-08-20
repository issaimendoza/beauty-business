# Documentación

Esta carpeta convierte las decisiones de producto y desarrollo en la fuente de verdad del repositorio.

## Documentos principales

| Documento | Pregunta que responde |
|---|---|
| [PRODUCT.md](PRODUCT.md) | ¿Por qué existe el producto y qué resultado busca? |
| [SCOPE.md](SCOPE.md) | ¿Qué incluye y qué no incluye esta etapa? |
| [DISCOVERY.md](DISCOVERY.md) | ¿Qué debemos aprender del proceso actual antes de implementar? |
| [DOMAIN.md](DOMAIN.md) | ¿Cómo funciona el negocio y qué significan sus términos? |
| [ARCHITECTURE.md](ARCHITECTURE.md) | ¿Cómo construiremos la solución? |
| [DESIGN.md](DESIGN.md) | ¿Cómo debe verse, responder y explicar sus estados la interfaz? |
| [DEVELOPMENT_ENVIRONMENT.md](DEVELOPMENT_ENVIRONMENT.md) | ¿Cómo se levantan las dependencias locales? |
| [DEPLOYMENT.md](DEPLOYMENT.md) | ¿Cómo se publica Next.js en Netlify? |
| [CODING_STANDARDS.md](CODING_STANDARDS.md) | ¿Qué reglas debe cumplir el código? |
| [HEXAGONAL_ADAPTATION.md](HEXAGONAL_ADAPTATION.md) | ¿Qué reglas del template hexagonal se adoptaron y cómo? |
| [DECISIONS.md](DECISIONS.md) | ¿Qué alternativas se evaluaron y qué se decidió? |
| [ROADMAP.md](ROADMAP.md) | ¿Cómo evoluciona la medición durante 6–9 meses? |
| [BACKLOG.md](BACKLOG.md) | ¿En qué orden se construirán las capacidades? |

## Especificaciones y planes

- [`features/`](features/README.md): comportamiento esperado y criterios de aceptación.
- [`plans/`](plans/README.md): planes de ejecución revisables antes de implementar trabajo complejo.

## Jerarquía de autoridad

Cuando haya contradicciones:

1. Una decisión explícita y reciente del propietario del producto.
2. `PRODUCT.md` y `SCOPE.md`.
3. `DOMAIN.md` para reglas del negocio.
4. La especificación de la funcionalidad.
5. `ARCHITECTURE.md` para decisiones técnicas.
6. `DESIGN.md` para experiencia e interfaz.
7. Un plan de ejecución.

Un plan nunca puede ampliar por sí solo el alcance del producto.
