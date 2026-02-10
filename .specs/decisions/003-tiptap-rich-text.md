# ADR 003: TipTap como editor de texto enriquecido

**Status:** Accepted
**Date:** 2026-02-09
**Context:** Se necesitaba un editor rich text para documentos de proyecto y HU, con soporte para tablas, code blocks con syntax highlighting, task lists, y links.

## Decision

Se eligio **TipTap** (basado en ProseMirror) como editor rich text, con output en **HTML** (no Markdown).

Extensiones instaladas:
- StarterKit (bold, italic, headings, lists, etc.)
- Link, Table (+ cell, header, row), TaskList + TaskItem
- CodeBlockLowlight (syntax highlighting)
- Placeholder

El viewer usa **react-markdown** (con remark-gfm) para Markdown puro, y `dangerouslySetInnerHTML` para HTML de TipTap.

## Alternatives Considered

- **Slate.js**: Mas bajo nivel, mas flexible pero requiere mas trabajo para features basicas
- **Quill**: Popular pero menos extensible, no tiene buen soporte para tablas
- **MDX Editor**: Nativo Markdown pero menos features de rich text
- **BlockNote**: Basado en TipTap pero mas opinionado, menos control

## Consequences

- Output HTML: TipTap produce HTML, no Markdown. Esto simplifica el editor pero complica la interoperabilidad
- Dual rendering: El viewer necesita detectar si el contenido es HTML o Markdown y renderizar diferente
- Bundle size: TipTap + extensiones + ProseMirror son ~150KB+ de JS. El First Load JS de paginas con editor es alto (~380KB)
- Extensibilidad: Agregar nuevas features (mentions, AI, etc.) es facil con el sistema de extensiones de TipTap
- dangerouslySetInnerHTML: Potencial riesgo de XSS que deberia mitigarse con sanitizacion
