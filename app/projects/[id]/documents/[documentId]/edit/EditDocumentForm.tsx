'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Document, DocumentType, DOCUMENT_TYPES } from '@/lib/types'
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
import { ArrowLeft, Save, Loader2, Check } from 'lucide-react'
import Link from 'next/link'
import type { SupabaseClient } from '@supabase/supabase-js'

interface EditDocumentFormProps {
  document: Document
  projectId: string
}

export function EditDocumentForm({ document: initialDocument, projectId }: EditDocumentFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialDocument.title)
  const [type, setType] = useState<DocumentType>(initialDocument.type)
  const [content, setContent] = useState(initialDocument.content)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  const saveDocument = useCallback(async (showToast = true) => {
    if (!title.trim()) {
      if (showToast) toast.error('El título es requerido')
      return false
    }

    setIsSaving(true)
    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('documents')
        .update({
          title: title.trim(),
          type,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initialDocument.id)

      if (error) throw error

      setLastSaved(new Date())
      if (showToast) {
        toast.success('Documento guardado')
      }
      return true
    } catch (error) {
      console.error('Error saving document:', error)
      if (showToast) {
        toast.error('Error al guardar', {
          description: 'No se pudo guardar el documento. Intenta de nuevo.'
        })
      }
      return false
    } finally {
      setIsSaving(false)
    }
  }, [title, type, content, initialDocument.id])

  const handleSaveAndReturn = async () => {
    const saved = await saveDocument(true)
    if (saved) {
      router.push(`/projects/${projectId}/documents/${initialDocument.id}`)
    }
  }

  const handleAutoSave = useCallback(() => {
    saveDocument(false)
  }, [saveDocument])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${projectId}/documents/${initialDocument.id}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display font-bold text-3xl text-sloth-800">
              Editar Documento
            </h1>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              {lastSaved && (
                <span className="flex items-center gap-1 text-moss-600">
                  <Check className="w-3.5 h-3.5" />
                  Guardado {lastSaved.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {isSaving && (
                <span className="flex items-center gap-1 text-moss-600 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/projects/${projectId}/documents/${initialDocument.id}`}>
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button
            onClick={handleSaveAndReturn}
            disabled={isSaving || !title.trim()}
            className="bg-moss-gradient text-white hover:opacity-90"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar y Volver
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
              <Select value={type} onValueChange={(v) => setType(v as DocumentType)}>
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
          autoSave={true}
          onSave={handleAutoSave}
        />
      </div>
    </div>
  )
}
