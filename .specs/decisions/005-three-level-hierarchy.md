# ADR 005: Jerarquia de 3 niveles (Proyecto > HU > Subtarea)

**Status:** Accepted
**Date:** 2026-02-09
**Context:** Inicialmente el proyecto tenia una estructura plana (Proyecto > Tasks). Se necesitaba una jerarquia que separara el valor de negocio (Historias de Usuario) de las tareas tecnicas (Subtareas), con criterios de aceptacion como checklist.

## Decision

Se reestructuro la informacion en 3 niveles:

1. **Proyecto (Epica)**: Contenedor principal con documentacion asociada
2. **Historia de Usuario (HU)**: Valor de negocio, con prioridad, criterios de aceptacion, documento detallado, y enlaces externos
3. **Subtarea**: Tarea tecnica con tipo (frontend/backend/etc), status drag-and-drop, asignacion, y story points

**Story points:**
- Se estiman a nivel de subtarea (via Planning Poker)
- Se hace rollup automatico a la HU
- Si el PM edita manualmente los SP de la HU, se activa `story_points_override` y deja de recalcularse

**Kanban:**
- Las HUs son secciones colapsables
- Las subtareas son las tarjetas draggables dentro de cada HU
- Cada HU tiene sus propias 3 columnas (backlog, in_progress, done)

## Alternatives Considered

- **Flat (Proyecto > Tasks)**: Mas simple pero no distingue negocio vs tecnico
- **4 niveles (Epica > Feature > HU > Task)**: Demasiado complejo para el scope actual
- **HUs con sub-HUs**: Confuso, mejor separar concepto de subtarea tecnica

## Consequences

- Claridad: Separacion clara entre "que" (HU) y "como" (Subtarea)
- Complejidad de UI: Cada HU necesita su propio mini-kanban (3 columnas)
- Migracion: Requirio migracion SQL y reescritura completa de componentes
- Escalabilidad: Con muchas HUs abiertas, el board puede volverse pesado (mitigable con collapse)
- Planning Poker: Ahora estima subtareas, el rollup a HU es automatico
