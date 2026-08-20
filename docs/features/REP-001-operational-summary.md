# REP-001 — Resumen operativo básico

## Objetivo

Comprobar que los datos capturados permiten entender la operación sin convertir la V1 en una plataforma de BI.

## Historia

Como socio analista, quiero revisar un periodo para conocer actividad, ingreso real, gastos y demanda perdida.

## Indicadores iniciales

- Venta bruta.
- Ingreso del salón.
- Monto de colaboradores.
- Número de visitas.
- Número de servicios.
- Ticket promedio por visita.
- Servicios más vendidos.
- Ventas por colaborador.
- Demanda del salón frente a demanda del colaborador.
- Duración promedio por servicio.
- Actividad por día y horario.
- Gastos por categoría.
- Oportunidades perdidas por motivo.

## Criterios de aceptación

1. El usuario puede elegir un periodo.
2. Ventas e ingreso del salón aparecen con nombres inequívocos y nunca como un único «ingreso» ambiguo.
3. Los totales se derivan de eventos individuales.
4. El reparto cumple con los snapshots guardados.
5. Los indicadores permiten segmentar al menos por persona, servicio y origen cuando corresponda.
6. Estados sin datos son claros y no presentan ceros engañosos.
7. Los cálculos clave tienen pruebas con conjuntos de datos conocidos.

## Fuera de alcance

- Constructor de reportes.
- Exportaciones contables.
- Pronósticos.
- Metas y alertas.
- Gráficas detalladas, comparación, filtros multidimensionales y drill-down; estas capacidades pertenecen a `REP-002`.
- Datos en tiempo real mediante streaming.

## Done when

- Un periodo de prueba permite responder qué entró, qué salió y qué se perdió.
- Los números pueden rastrearse hasta sus registros fuente.
- Las pruebas verifican fórmulas y filtros.
- Las definiciones quedan listas para reutilizarse sin duplicación en `REP-002`.
