# ADR 004: @hello-pangea/dnd para Drag & Drop

**Status:** Accepted
**Date:** 2026-02-09
**Context:** Se necesitaba drag & drop para mover subtareas entre columnas de status (backlog, in_progress, done) dentro de cada historia de usuario.

## Decision

Se eligio **@hello-pangea/dnd** (fork mantenido de react-beautiful-dnd) para implementar drag & drop en el Kanban board.

Patron de IDs: Los droppable IDs codifican `{storyId}:{status}`, lo que permite:
- Identificar la HU destino y el nuevo status en un solo string
- Validar que el drag sea dentro de la misma HU
- Bloquear movimientos entre HUs distintas

## Alternatives Considered

- **react-beautiful-dnd**: Deprecado por Atlassian, sin mantenimiento
- **dnd-kit**: Mas moderno y flexible, pero API mas compleja para el caso de uso basico
- **react-dnd**: Bajo nivel, requiere mucho mas codigo para lograr el mismo resultado
- **Sortable.js**: No React-native, requiere wrapper

## Consequences

- API simple: `DragDropContext > Droppable > Draggable` es intuitivo
- Accesibilidad: Soporte de keyboard drag built-in
- Hydration issue: Necesita workaround para SSR (isMounted check o DragDropWrapper)
- Limitacion: No soporta nativamente multi-container drag (entre HUs), pero esto se resolvio bloqueando el comportamiento
- Encoding pattern: `storyId:status` como droppable ID es una convencion propia que funciona pero acopla la logica de parsing
