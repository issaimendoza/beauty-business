# Beauty Business

Aplicación protegida de captura operativa, finanzas y análisis para un estudio de belleza. Registra servicios realizados, reparto económico, gastos, demanda perdida y cierres diarios; después permite explorar los registros mediante Dashboard e Insights.

## Funcionalidades

- Acceso para dos cuentas aprovisionadas, sin registro público.
- Colaboradoras y acuerdos económicos con vigencia e historial.
- Servicios con edición, desactivación, cursor keyset y autocomplete remoto.
- Visitas con múltiples servicios, precio y reparto sugeridos, ajustes justificados y snapshots históricos.
- Alta contextual de servicios o captura temporal para completar el catálogo después.
- Gastos, productos, proveedores, categorías y oportunidades perdidas.
- Cierre diario con totales derivados, conciliación de efectivo y alertas.
- Dashboard e Insights por periodo con comparación, filtros, gráficas y tablas accesibles.

El producto no es todavía un POS, CRM, agenda, nómina, inventario ni sistema contable o fiscal.

## Requisitos

- Node.js compatible con Next.js 16.
- npm.
- Docker Desktop con Compose.

La aplicación Next.js corre en el host. Docker ejecuta solamente PostgreSQL y futuras dependencias de infraestructura aprobadas.

## Preparación local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` como `.env.local` y reemplaza la contraseña de PostgreSQL y el secreto de autenticación.

3. Levanta PostgreSQL:

   ```bash
   docker compose --env-file .env.local up -d --wait
   ```

4. Aplica migraciones y el seed idempotente de catálogos:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Aprovisiona exactamente las dos cuentas autorizadas. El comando solicita la contraseña dos veces sin mostrarla ni guardarla en el historial:

   ```bash
   npm run auth:provision -- --email=propietaria@ejemplo.com --name="Propietaria"
   npm run auth:provision -- --email=operadora@ejemplo.com --name="Operadora"
   ```

   Ejecutar de nuevo el comando para el mismo correo actualiza intencionalmente su nombre y contraseña. Nunca imprime la contraseña ni su hash.

6. Inicia la aplicación:

   ```bash
   npm run dev
   ```

Abre `http://localhost:3000`. Para detener infraestructura sin perder datos:

```bash
docker compose --env-file .env.local down
```

## Migraciones y base de datos

```bash
npm run db:generate -- --name=descripcion_del_cambio
npm run db:migrate
npm run db:check
npm run db:studio
```

El contenedor nunca ejecuta migraciones ni seeds automáticamente. Los archivos bajo `drizzle/` son la historia versionada y no deben reescribirse después de aplicarse.

## Bootstrap de una base existente

Para una base productiva, copia `.env.example` a `.env.bootstrap` (gitignored), pon `DATABASE_URL` y las dos cuentas, y desde CMD:

```bat
scripts\bootstrap.cmd
```

Equivale a:

```bat
npm run db:bootstrap -- --env-file=.env.bootstrap
```

El comando aplica migraciones, el seed de catálogos y crea o actualiza hasta dos cuentas. Las contraseñas viven solo en ese archivo local; no se imprimen ni se pasan como argumentos. No uses `.env.production` para este archivo: Next.js lo carga en el build. `migrate`, `seed` y `auth:provision` también aceptan `--env-file=...`.

## Publicación en Netlify

`netlify.toml` indica a Netlify que construya con `npm run build`, publique `.next` y use Node.js 22. PostgreSQL no se aloja en Netlify: configura `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` y `BUSINESS_TIME_ZONE` en la UI del sitio. El build no migra ni crea usuarios; eso se hace desde una máquina de confianza con `db:bootstrap`. El procedimiento completo está en [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Validación

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Para incluir integración con PostgreSQL:

```bash
TEST_DATABASE_URL=postgresql://... npm run test
```

Para E2E instala Chromium una vez y usa una cuenta aprovisionada dentro de una base aislada de prueba. Los recorridos crean datos operativos y no deben apuntar a una base con información real:

```bash
npx playwright install chromium
E2E_USER_EMAIL=... E2E_USER_PASSWORD=... npm run test:e2e
```

## Documentación

La fuente de verdad comienza en [docs/README.md](docs/README.md). Consulta producto, alcance, dominio, arquitectura, diseño, decisiones y las especificaciones bajo `docs/features/` antes de modificar una regla de negocio.

La zona horaria se configura con `BUSINESS_TIME_ZONE`. `America/Mexico_City` es únicamente el valor documentado para desarrollo hasta que el negocio confirme la definitiva.
