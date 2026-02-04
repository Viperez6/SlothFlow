'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DocumentType, DOCUMENT_TYPES } from '@/lib/types'
import { getTemplateForType } from '@/lib/document-templates'
import { MarkdownEditor } from '@/components/documents/MarkdownEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

interface NewDocumentFormProps {
  projectId: string
  userId: string
}

export function NewDocumentForm({ projectId, userId }: NewDocumentFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<DocumentType>('general')
  const [content, setContent] = useState(getTemplateForType('general'))
  const [isSaving, setIsSaving] = useState(false)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  const handleTypeChange = (newType: DocumentType) => {
    setType(newType)
    // Only apply template if content is empty or still the default
    if (!content || content === getTemplateForType(type)) {
      setContent(getTemplateForType(newType))
    }
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
        .from('documents')
        .insert({
          project_id: projectId,
          title: title.trim(),
          type,
          content,
          created_by: userId,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Documento creado', {
        description: 'El documento se ha guardado correctamente.'
      })

      router.push(`/projects/${projectId}/documents/${data.id}`)
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
          <Link href={`/projects/${projectId}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display font-bold text-3xl text-sloth-800">
              Nuevo Documento
            </h1>
            <p className="text-muted-foreground">
              Crea un nuevo documento para el proyecto
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/projects/${projectId}`}>
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de documento</Label>
              <Select value={type} onValueChange={(v) => handleTypeChange(v as DocumentType)}>
                <SelectTrigger className="border-moss-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DOCUMENT_TYPES) as DocumentType[]).map(docType => {
                    const config = DOCUMENT_TYPES[docType]
                    return (
                      <SelectItem key={docType} value={docType}>
                        <span className="flex items-center gap-2">
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
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
