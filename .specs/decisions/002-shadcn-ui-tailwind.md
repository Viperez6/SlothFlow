# ADR 002: shadcn/ui + Tailwind CSS con tema custom

**Status:** Accepted
**Date:** 2026-02-09
**Context:** Se necesitaba un sistema de UI components rapido de usar pero altamente customizable, con una identidad visual unica (tema "sloth/moss/earth").

## Decision

Se eligio **shadcn/ui** (componentes copiados al proyecto sobre Radix primitives) con **Tailwind CSS** y un tema custom con paleta organica.

- 14 componentes de shadcn/ui instalados manualmente
- Paleta custom: `sloth` (verde organico), `moss` (verde musgo), `earth` (marron tierra)
- CSS variables para temas (preparado para dark mode)
- `class-variance-authority` para variantes de componentes
- `tailwind-merge` + `clsx` via funcion `cn()`

## Alternatives Considered

- **Material UI**: Componentes listos pero dificil de customizar profundamente, bundle grande
- **Chakra UI**: Bueno pero opinionated en tema, CSS-in-JS puede tener problemas con SSR
- **Radix UI directo**: Mas control pero mas trabajo de styling desde cero
- **Ant Design**: Muy enterprise, dificil de hacer "organico"

## Consequences

- Control total: Los componentes son archivos propios, se pueden modificar libremente
- Consistencia: Radix primitives garantizan accesibilidad (a11y) out of the box
- Tema unico: La paleta sloth/moss/earth da identidad visual diferenciada
- Trabajo manual: Cada nuevo componente requiere instalacion de dependencia Radix + crear archivo
- No hay component updates automaticos: Si shadcn actualiza un componente, hay que actualizar manualmente
