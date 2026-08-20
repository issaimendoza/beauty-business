# CAT-001 — Personal y colaboradores

## Objetivo

Mantener las personas que realizan servicios y su acuerdo económico vigente para poder atribuir actividad y calcular repartos.

## Historia

Como Andrea, quiero registrar y mantener colaboradores para seleccionarlos durante una atención sin recalcular manualmente su participación.

## Datos iniciales

- Nombre.
- Estado activo/inactivo.
- Especialidad o descripción opcional.
- Tipo de participación: propietaria/socia, empleado, comisión, renta de espacio u otro.
- Tipo de acuerdo económico.
- Porcentaje para el salón, cuando aplique.
- Indicación de herramientas propias o del salón.
- Indicación de materiales propios o del salón.
- Fecha de vigencia del acuerdo.

## Criterios de aceptación

1. Andrea puede crear, consultar, editar y desactivar un colaborador.
2. Un colaborador inactivo no aparece por defecto en nuevas capturas.
3. Desactivar o editar no altera servicios realizados anteriormente.
4. Los porcentajes válidos están dentro del rango permitido y se almacenan con precisión explícita.
5. Un acuerdo tiene vigencia identificable.
6. La UI distingue claramente el porcentaje del salón del porcentaje del colaborador.
7. Un colaborador puede seleccionarse en `OPS-001`.

## Fuera de alcance

- Nómina.
- Asistencia y horarios laborales.
- Liquidación o pago de comisiones.
- Roles de acceso de la aplicación.
- Modelo final de renta fija de espacio hasta resolver su regla de cálculo.

## Preguntas abiertas

- ¿Cómo se calcula una renta fija o acuerdo híbrido?
- ¿Andrea también se modela como colaboradora con 100 % para el salón?

La V1 conserva historial explícito de acuerdos con vigencias, además del snapshot de cada transacción.

## Done when

- El catálogo se administra sin eliminar historia.
- Las validaciones y reglas tienen pruebas.
- `OPS-001` puede consumir un acuerdo vigente sin depender de la UI.
