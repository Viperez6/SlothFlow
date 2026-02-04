import { DocumentType } from './types'

export const DOCUMENT_TEMPLATES: Record<DocumentType, string> = {
  prd: `<h1>Product Requirements Document</h1>

<h2>Objetivo</h2>
<p>[Describe el objetivo del producto/feature]</p>

<h2>Contexto</h2>
<p>[Contexto del problema que resolvemos]</p>

<h2>Requisitos Funcionales</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">Requisito 1</li>
  <li data-type="taskItem" data-checked="false">Requisito 2</li>
  <li data-type="taskItem" data-checked="false">Requisito 3</li>
</ul>

<h2>Requisitos No Funcionales</h2>
<ul>
  <li><strong>Performance</strong>: [Criterios de performance]</li>
  <li><strong>Seguridad</strong>: [Requerimientos de seguridad]</li>
  <li><strong>Escalabilidad</strong>: [Necesidades de escalabilidad]</li>
</ul>

<h2>Out of Scope</h2>
<p>[Lo que NO se incluye en este release]</p>

<h2>Timeline</h2>
<ul>
  <li>Inicio: [Fecha]</li>
  <li>Beta: [Fecha]</li>
  <li>Launch: [Fecha]</li>
</ul>

<h2>Métricas de Éxito</h2>
<p>[Cómo mediremos el éxito]</p>
`,

  spec: `<h1>Technical Specification</h1>

<h2>Overview</h2>
<p>[Resumen técnico de la implementación]</p>

<h2>Architecture</h2>
<p>[Descripción de la arquitectura]</p>

<pre><code class="language-typescript">// Diagrama o pseudocódigo
interface Example {
  id: string
  name: string
}
</code></pre>

<h2>API Endpoints</h2>

<h3>Endpoint 1</h3>
<pre><code class="language-typescript">GET /api/endpoint
Response: { data: [...] }
</code></pre>

<h2>Database Schema</h2>
<pre><code class="language-sql">CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
</code></pre>

<h2>Dependencies</h2>
<ul>
  <li>Librería 1 - v1.0.0</li>
  <li>Librería 2 - v2.0.0</li>
</ul>

<h2>Implementation Plan</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">Step 1</li>
  <li data-type="taskItem" data-checked="false">Step 2</li>
  <li data-type="taskItem" data-checked="false">Step 3</li>
</ul>

<h2>Testing Strategy</h2>
<p>[Estrategia de testing]</p>
`,

  meeting_notes: `<h1>Meeting Notes</h1>

<p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}<br/>
<strong>Tipo:</strong> [Planning / Retro / Daily]</p>

<h2>Participantes</h2>
<ul>
  <li>Persona 1</li>
  <li>Persona 2</li>
</ul>

<h2>Agenda</h2>
<ol>
  <li>Tema 1</li>
  <li>Tema 2</li>
  <li>Tema 3</li>
</ol>

<h2>Notas</h2>
<p>[Notas de la reunión]</p>

<h2>Action Items</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">@persona: Tarea 1</li>
  <li data-type="taskItem" data-checked="false">@persona: Tarea 2</li>
</ul>

<h2>Próxima Reunión</h2>
<p>[Fecha y temas]</p>
`,

  retrospective: `<h1>Sprint Retrospective</h1>

<p><strong>Sprint:</strong> [Número/Nombre]<br/>
<strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>

<h2>What Went Well</h2>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<h2>What Didn't Go Well</h2>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<h2>Ideas / Improvements</h2>
<ul>
  <li>Idea 1</li>
  <li>Idea 2</li>
</ul>

<h2>Action Items</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">Acción 1</li>
  <li data-type="taskItem" data-checked="false">Acción 2</li>
</ul>

<h2>Metrics</h2>
<table>
  <tr>
    <th>Métrica</th>
    <th>Valor</th>
  </tr>
  <tr>
    <td>Velocity</td>
    <td>[SP]</td>
  </tr>
  <tr>
    <td>Completed</td>
    <td>[X tasks]</td>
  </tr>
  <tr>
    <td>Bugs</td>
    <td>[Y]</td>
  </tr>
</table>
`,

  general: `<h1>Documento</h1>

<p>Comienza a escribir aquí...</p>
`,
}

export function getTemplateForType(type: DocumentType): string {
  return DOCUMENT_TEMPLATES[type] || DOCUMENT_TEMPLATES.general
}
