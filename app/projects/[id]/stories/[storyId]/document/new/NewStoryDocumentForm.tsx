'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
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

interface NewStoryDocumentFormProps {
  projectId: string
  storyId: string
  storyTitle: string
}

export function NewStoryDocumentForm({ projectId, storyId, storyTitle }: NewStoryDocumentFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
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
      toast.error('El titulo es requerido')
      return
    }

    setIsSaving(true)
    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('user_story_documents')
        .insert({
          user_story_id: storyId,
          title: title.trim(),
          content,
        })

      if (error) throw error

      toast.success('Documento creado')
      router.push(`/projects/${projectId}/stories/${storyId}/document`)
    } catch (error) {
      console.error('Error saving document:', error)
      toast.error('Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${projectId}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">HU: {storyTitle}</p>
            <h1 className="font-display font-bold text-3xl text-sloth-800">
              Nuevo Documento
            </h1>
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

      <Card className="border-moss-100 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl">Detalles del documento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo *</Label>
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
