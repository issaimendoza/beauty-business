# Ambiente de desarrollo

## Estado

Política implementada mediante `compose.yaml`.

## Objetivo

Levantar de forma reproducible las dependencias locales sin instalar bases de datos ni servicios auxiliares directamente en la máquina del desarrollador.

## Límite del Compose

```text
Máquina del desarrollador
├── Node.js / npm
├── Next.js (`npm run dev`)
└── Docker Compose
    ├── PostgreSQL
    └── futuras dependencias aprobadas
```

El proyecto Next.js no se construye ni ejecuta dentro de Docker durante desarrollo.

## Servicios iniciales

### PostgreSQL

El `compose.yaml` incluye:

- imagen con versión explícita;
- puerto local documentado;
- base, usuario y contraseña de desarrollo mediante variables;
- volumen nombrado;
- healthcheck;
- configuración suficiente para que la aplicación del host se conecte por `localhost`.

No usar `container_name`, porque limita el aislamiento de Compose y provoca colisiones entre worktrees o proyectos.

## Comandos esperados

```bash
docker compose --env-file .env.local up -d --wait
docker compose --env-file .env.local ps
docker compose --env-file .env.local logs -f postgres
docker compose --env-file .env.local down
```

`docker compose down` debe conservar los datos. El reset con eliminación de volumen será una acción separada, explícita y documentada; nunca el camino normal.

## Aplicación

Con las dependencias saludables:

```bash
npm run dev
```

Esto conserva hot reload, depuración local y acceso directo a las herramientas de Node.

## Migraciones y seeds

El arranque del contenedor no ejecuta migraciones ni seeds. Se usarán comandos explícitos del proyecto después de que PostgreSQL esté saludable.

Razones:

- evitar cambios de esquema inesperados;
- mantener visible qué versión se aplica;
- impedir que datos de ejemplo entren accidentalmente en otro ambiente;
- hacer que fallas de migración sean claras y recuperables.

Comandos implementados:

```bash
npm run db:migrate
npm run db:seed
npm run db:bootstrap
npm run db:check
```

Los scripts cargan primero `.env.local` y requieren únicamente `DATABASE_URL`; migrar o sembrar catálogos no depende del secreto de autenticación. El seed es idempotente y no crea usuarios ni contiene credenciales. Todos aceptan `--env-file=ruta` para apuntar a otro archivo gitignored, por ejemplo `.env.bootstrap`.

Las dos cuentas se aprovisionan por separado en una terminal interactiva:

```bash
npm run auth:provision -- --email=persona@ejemplo.com --name="Nombre visible"
```

La contraseña se solicita y confirma sin eco. Repetir el comando para el mismo correo actualiza intencionalmente sus credenciales.

Para preparar una base ya creada (migraciones, catálogos y hasta dos cuentas leídas del env) sin escribir secretos en la línea de comandos:

```bat
npm run db:bootstrap -- --env-file=.env.bootstrap
```

En CMD también puede usarse `scripts\bootstrap.cmd`. Las variables `BOOTSTRAP_USER_*` solo las lee ese script administrativo; no forman parte de la configuración de runtime de Next.js.

## Nuevas dependencias

Una nueva dependencia puede añadirse al Compose solo cuando:

1. una funcionalidad aprobada la requiere;
2. se documenta su propósito;
3. tiene versión explícita y healthcheck cuando sea posible;
4. su configuración no expone secretos;
5. se actualizan README, `.env.example` y verificaciones relevantes.

No se agregarán Redis, RabbitMQ, correo, almacenamiento u observabilidad de forma preventiva.

## Pruebas

Las pruebas de integración usan la conexión explícita `TEST_DATABASE_URL`. En CI debe apuntar a una base PostgreSQL aislada; localmente puede apuntar al contenedor de desarrollo cuando se acepte conservar los datos adicionales de prueba.

La publicación de Next.js en Netlify no usa este Compose. El procedimiento está en `DEPLOYMENT.md`.
