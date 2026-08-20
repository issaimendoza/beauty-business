# Producto

## Nombre de trabajo

**Beauty Business Data Collector**

## Contexto

El estudio ofrece servicios como uñas, pestañas y peinados. Actualmente opera principalmente con experiencia práctica, pero sin un registro suficiente para conocer con precisión cuánto vende, cuántas personas atiende, qué servicios realiza, cuánto gasta o qué demanda pierde.

La participación tecnológica comienza como una función de análisis: crear trazabilidad, observar el negocio y formar una base histórica antes de decidir si conviene comprar, integrar o construir un sistema más amplio.

## Problema

El negocio funciona, pero no deja suficientes rastros confiables. Preguntar «¿cuánto ganas?» no produce una respuesta útil cuando todavía no existe un control operativo.

La etapa inicial debe conseguir que el negocio produzca datos consistentes sin volver pesada la operación cotidiana.

## Visión

Crear una herramienta extremadamente sencilla que registre la operación real durante 6–9 meses y permita entender el negocio antes de decidir su plataforma administrativa definitiva.

## Etapa 0: registro operativo y línea base

La etapa 0 no busca optimizar ni automatizar todo el negocio. Busca medir primero.

El producto debe permitir reconstruir eventos individuales para conocer:

- servicios y visitas realizadas;
- clientes atendidos y duración de la atención;
- valor total cobrado dentro del salón;
- ingreso que realmente corresponde al salón;
- monto que corresponde al colaborador;
- origen de la demanda;
- gastos y compras;
- oportunidades de venta perdidas;
- diferencias entre precios de lista y cobros reales.

## Usuarios iniciales

### Andrea

Socia y operadora principal. Registra la actividad cotidiana, mantiene catálogos sencillos y necesita hacerlo con la menor fricción posible.

### Analista/socio tecnológico

Define qué medir, revisa la calidad de los datos, interpreta los resultados y dirige la evolución del producto.

### Colaboradores

Personas permanentes o externas que realizan servicios. Pueden trabajar por comisión, usar herramientas o materiales propios y generar o atender demanda del salón.

Andrea y el analista/socio tecnológico serán las dos únicas cuentas iniciales. Los colaboradores son conceptos operativos del negocio y no obtienen acceso a la aplicación durante la V1.

## Objetivos iniciales

- Registrar actividad comercial evento por evento.
- Distinguir ventas brutas de ingreso real del salón.
- Registrar el reparto económico con colaboradores.
- Identificar si la demanda fue generada por el salón o por el colaborador.
- Registrar dinero que sale y su motivo.
- Registrar demanda no atendida o no concretada.
- Mantener catálogos vivos de personal, servicios, productos y proveedores.
- Proteger la aplicación publicada con dos cuentas individuales de acceso completo.
- Construir una línea base histórica útil para análisis posterior.
- Explorar la línea base mediante Insights con filtros temporales, gráficas y trazabilidad hasta los registros fuente.
- Preparar el repositorio para un flujo de desarrollo agent-first medible.

## Principios del producto

### Medir antes de optimizar

Las primeras semanas deben revelar cómo funciona realmente el negocio. No se automatiza un proceso todavía desconocido.

### Registrar eventos, no totales declarados

La venta diaria debe calcularse sumando atenciones individuales. Un cierre diario sirve para conciliación, no como fuente principal.

### Captura rápida

El flujo principal debe aspirar a completarse en 20–40 segundos. Los datos derivados no deben pedirse manualmente.

### Conservar la historia

Las transacciones conservan los importes, porcentajes y acuerdos vigentes al ocurrir. Una modificación futura no altera el pasado.

### Aprendizaje progresivo

Los formularios, catálogos y reglas crecerán conforme aparezca evidencia. Las dudas se documentan; no se convierten prematuramente en código.

## Resultado esperado a 30 días

Con captura consistente, debe ser posible responder aproximadamente:

- cuántas visitas y servicios hubo;
- cuánto valor se vendió;
- cuánto ingresó realmente al salón;
- cuánto correspondió a colaboradores;
- cuál fue el ticket promedio;
- qué servicios y días fueron más activos;
- cuánto duró cada tipo de servicio;
- cuánto se gastó y en qué categorías;
- qué oportunidades se perdieron y por qué;
- cómo evolucionaron ingresos, egresos, pagos y actividad dentro del periodo;
- por qué cambiaron precios o repartos frente a las sugerencias.

No se exige todavía un margen perfecto, un CRM ni consumo exacto por servicio.

## Resultado esperado a 6–9 meses

Contar con información histórica suficiente para decidir con evidencia entre:

- continuar evolucionando la aplicación propia;
- integrar o comprar software especializado;
- sustituir módulos concretos;
- ampliar hacia inventario, agenda, clientes, costos, automatizaciones o analítica avanzada.

## Éxito de la PoC agéntica

Además del resultado del negocio, el proyecto medirá el flujo agent-first por funcionalidad:

- intentos del agente;
- intervenciones humanas;
- cambios manuales de código;
- pruebas generadas;
- defectos encontrados en revisión;
- planes aceptados o corregidos;
- funcionalidades completadas por el agente.

El propósito es evaluar un proceso donde humanos dirigen y revisan, mientras los agentes planean, implementan, prueban y documentan dentro de límites explícitos.
