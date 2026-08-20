# FND-002 — Acceso básico

## Objetivo

Proteger una aplicación accesible desde Internet con un login sencillo para dos personas autorizadas, sin introducir registro público, roles ni administración completa de identidades.

## Historia

Como propietaria, quiero que solo las dos personas autorizadas puedan entrar a la aplicación aunque su URL sea pública, para evitar que terceros consulten o modifiquen la operación.

## Alcance

- Dos cuentas individuales con acceso completo a todas las capacidades de la V1.
- Identificador de acceso y contraseña.
- Pantalla pública `/login`.
- Protección por defecto de páginas, Server Actions y Route Handlers de negocio.
- Sesión revocable mediante cookie segura.
- Cierre de sesión.
- Aprovisionamiento explícito de las dos cuentas sin registro abierto.
- Hash de contraseñas con Argon2id o una alternativa documentada si el runtime objetivo no lo soporta.
- Limitación temporal y progresiva de intentos repetidos.
- Registro técnico mínimo de inicio exitoso, fallo y cierre de sesión, sin contraseñas, cookies ni tokens.

La URL será pública; los datos y operaciones no lo serán. La UI protegida no debe renderizarse ni consultar datos antes de validar la sesión en el servidor.

## Aprovisionamiento

Las cuentas se crean mediante un comando administrativo explícito que:

- solicita la contraseña sin mostrarla ni dejarla en el historial del shell, o la lee de un archivo gitignored durante el bootstrap productivo;
- guarda únicamente su hash con salt;
- no imprime la contraseña, el hash ni secretos;
- permite actualizar la contraseña de una cuenta existente de forma intencional;
- no utiliza un seed con credenciales reales versionadas.

La implementación usa `npm run auth:provision -- --email=... --name=...` en una terminal interactiva. Para una base productiva, `npm run db:bootstrap -- --env-file=.env.bootstrap` (o `scripts\bootstrap.cmd`) aplica migraciones, el seed de catálogos y hasta dos cuentas leídas de `BOOTSTRAP_USER_*` en un archivo gitignored. El seed de base de datos contiene únicamente catálogos no sensibles. Las contraseñas de bootstrap no se documentan con valores reales, no se pasan como argumentos del shell y no se cargan en el runtime de Next.js.

Las dos cuentas deben ser individuales. No se utilizará una cuenta compartida, aunque ambas tengan exactamente los mismos permisos.

## Sesión

- La sesión se valida en el servidor en cada operación protegida.
- La cookie de producción usa HTTPS y los atributos `HttpOnly`, `Secure`, `SameSite=Lax` o más restrictivo, `Path=/` y sin `Domain` cuando el mecanismo elegido lo permita.
- Los identificadores de sesión no se almacenan en `localStorage` ni `sessionStorage`.
- El cierre de sesión invalida la sesión del lado servidor, no solo oculta la UI.
- La duración se configura centralmente. El valor inicial será una jornada de hasta 12 horas, sin opción `Recordarme`.
- Una sesión expirada dirige a `/login` y muestra un mensaje comprensible después de autenticarse nuevamente.

## Mensajes

Un fallo de acceso utiliza un mensaje genérico:

```text
No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.
```

La respuesta no debe revelar si la cuenta existe, está inactiva o la contraseña fue incorrecta. Los intentos excesivos presentan una espera temporal y un mensaje normalizado, sin bloqueo permanente que pueda ser provocado por un tercero.

## Criterios de aceptación

1. `/login` es accesible sin sesión y no muestra datos operativos.
2. Toda página de negocio redirige a `/login` cuando no existe una sesión válida.
3. Toda Server Action y Route Handler protegido vuelve a validar la sesión en el servidor; ocultar páginas o botones no es suficiente.
4. Existen dos cuentas individuales y ambas tienen acceso completo, sin roles diferenciados.
5. No existe registro público, invitación, recuperación de contraseña ni administración de usuarios desde la UI.
6. Ninguna contraseña se almacena o registra en texto plano; se usa un algoritmo de hash adaptativo aprobado.
7. Las credenciales reales no aparecen en Git, `.env.example`, Compose, logs, URLs ni historial de comandos.
8. La sesión usa una cookie segura y revocable, expira y puede cerrarse explícitamente.
9. El login impide intentos automatizados repetidos mediante throttling temporal y progresivo.
10. Los errores de autenticación son genéricos y no permiten enumerar cuentas.
11. La UI muestra loading durante el envío y evita solicitudes duplicadas.
12. Al autenticar correctamente se vuelve al destino protegido solicitado cuando sea seguro.
13. Existen pruebas unitarias del flujo de credenciales y sesiones, pruebas de integración de protección y pruebas end-to-end de login y logout.
14. La implementación usa una librería de autenticación/sesiones mantenida y compatible con la versión instalada; no inventa criptografía ni un protocolo propio.

## Fuera de alcance

- Registro público.
- Recuperación o cambio de contraseña desde la UI.
- Verificación de correo.
- Roles y permisos diferenciados.
- Panel de usuarios.
- Inicio de sesión social.
- Magic links.
- MFA.
- SSO.
- Invitaciones.
- API pública autenticada.

## Preguntas abiertas

- Identificadores definitivos de las dos cuentas; se proporcionarán de forma segura al aprovisionarlas.
- Canal operativo para solicitar un cambio manual de contraseña.

## Done when

- Una persona no autenticada no puede leer ni modificar datos aunque conozca una URL interna.
- Las dos cuentas autorizadas pueden iniciar y cerrar sesión.
- Las pruebas cubren protección de rutas y operaciones, expiración, credenciales inválidas y throttling.
- Los checks del repositorio pasan.
- No se versionó ni registró ningún secreto.

## Referencias de seguridad

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).
