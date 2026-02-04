'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Task } from '@/lib/types'
import { MarkdownEditor } from '@/components/documents/MarkdownEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { SupabaseClient } from '@supabase/supabase-js'

interface NewTaskDocumentFormProps {
  task: Task
  projectId: string
}

const DEFAULT_TEMPLATE = `<h2>Descripción Técnica</h2>
<p>Describe en detalle la implementación técnica...</p>

<h2>Análisis</h2>
<p>Detalla el análisis realizado...</p>

<h2>Decisiones de Diseño</h2>
<ul>
  <li>Decisión 1: ...</li>
  <li>Decisión 2: ...</li>
</ul>

<h2>Consideraciones</h2>
<p>Aspectos importantes a tener en cuenta...</p>

<h2>Referencias</h2>
<ul>
  <li>Recurso 1</li>
  <li>Recurso 2</li>
</ul>
`

export function NewTaskDocumentForm({ task, projectId }: NewTaskDocumentFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(`Documento: ${task.title}`)
  const [content, setContent] = useState(DEFAULT_TEMPLATE)
  const [isSaving, setIsSaving] = useState(false)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('El título es requerido')
      return
    }

    setIsSaving(true)
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('task_documents')
        .insert({
          task_id: task.id,
          title: title.trim(),
          content,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Documento creado', {
        description: 'El documento se ha guardado correctamente.'
      })

      router.push(`/projects/${projectId}/tasks/${task.id}/document`)
    } catch (error) {
      console.error('Error saving document:', error)
      toast.error('Error al guardar', {
        description: 'No se pudo crear el documento. Intenta de nuevo.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${projectId}/tasks/${task.id}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Tarea: {task.title}
            </p>
            <h1 className="font-display font-bold text-3xl text-sloth-800">
              Nuevo Documento Detallado
            </h1>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/projects/${projectId}/tasks/${task.id}`}>
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="bg-moss-gradient text-white hover:opacity-90"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Crear Documento
          </Button>
        </div>
      </div>

      {/* Form */}
      <Card className="border-moss-100 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl">Detalles del documento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre del documento"
              className="border-moss-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <div>
        <Label className="mb-2 block">Contenido</Label>
        <MarkdownEditor
          content={content}
          onChange={setContent}
          placeholder="Escribe el contenido del documento..."
          minHeight="500px"
        />
      </div>
    </div>
  )
}
