# Despliegue

## Estado

La aplicación Next.js se publica en Netlify. PostgreSQL permanece como sistema de registro externo. Las migraciones, el seed y el aprovisionamiento de cuentas no forman parte del build.

## Qué publica Netlify

`netlify.toml` indica a Netlify cómo construir el monolito:

- comando: `npm run build`;
- directorio publicado: `.next`;
- Node.js 22;
- protección de skew para no romper sesiones activas al publicar.

No definas `NODE_ENV=production` en `netlify.toml` ni en la UI de Netlify. Si está presente durante `npm install`, npm omite `devDependencies` y el build falla al no encontrar `@tailwindcss/postcss`. `next build` fija producción por su cuenta; las funciones del runtime también corren en producción.

Netlify detecta Next.js 16 y aplica su adaptador OpenNext en cada build. No se fija `@netlify/plugin-nextjs` en `package.json` para recibir correcciones del adaptador.

HTTPS lo exige Netlify en el dominio del sitio. El Compose de desarrollo no se usa en producción.

## PostgreSQL

Netlify no aloja la base. Antes del primer despliegue útil hace falta un PostgreSQL accesible desde Internet (por ejemplo un servicio administrado) y su `DATABASE_URL`.

Conviene una URL con pooler (PgBouncer o el pooler del proveedor) porque cada instancia serverless abre conexiones. El cliente ya desactiva prepared statements (`prepare: false`) para compatibilidad con esos poolers.

## Variables en la UI de Netlify

Configúralas para **todos los contextos de deploy**, incluido el build. El build importa autenticación y base de datos, así que fallará si faltan en tiempo de compilación.

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Postgres externo. Secreto. |
| `BETTER_AUTH_URL` | Origen público HTTPS del sitio, por ejemplo `https://tu-sitio.netlify.app`. Debe coincidir con la URL que usa el navegador. |
| `BETTER_AUTH_SECRET` | Secreto de sesión, mínimo 32 caracteres, distinto al de desarrollo. |
| `BUSINESS_TIME_ZONE` | Zona horaria de negocio. `America/Mexico_City` solo si sigue siendo el valor acordado para operación. |

No coloques `BOOTSTRAP_USER_*`, contraseñas de cuenta ni `.env.bootstrap` en Netlify. Esas variables solo las leen scripts administrativos en una máquina de confianza. No uses el prefijo `NEXT_PUBLIC_` para secretos.

Tras un dominio propio, actualiza `BETTER_AUTH_URL` a ese origen y vuelve a desplegar. Los deploys de preview no están cubiertos: la cookie y `BETTER_AUTH_URL` apuntan al origen de producción.

## Primera publicación

1. Crea el sitio en Netlify enlazando este repositorio. La rama de producción es la que Netlify deba construir (hoy `main`).
2. Carga las variables de la tabla anterior. No copies `.env.local`.
3. Publica. El build no toca el esquema ni crea usuarios.
4. Desde una máquina de confianza, prepara la base:

   ```bat
   npm run db:bootstrap -- --env-file=.env.bootstrap
   ```

   `.env.bootstrap` es gitignored. Debe usar el mismo `DATABASE_URL` de producción y las dos cuentas. No lo nombres `.env.production`: Next.js lo cargaría en el build.

5. Abre `BETTER_AUTH_URL`, entra con una cuenta aprovisionada y comprueba que las rutas de negocio exigen sesión.

Un deploy posterior de código no vuelve a ejecutar bootstrap. Si una migración nueva ya está en `drizzle/`, aplícala explícitamente con `npm run db:migrate -- --env-file=.env.bootstrap` antes o inmediatamente después de publicar el código que la requiere.

## Lo que este camino no incluye

- CI propio (lint, typecheck, pruebas) aparte del build de Netlify.
- PostgreSQL, copias de seguridad o monitoreo como producto del repositorio.
- Migraciones automáticas al publicar.
- Registro público, más de dos cuentas o un panel de usuarios.

El detalle local sigue en `DEVELOPMENT_ENVIRONMENT.md`. El alcance de producto está en `SCOPE.md`.
