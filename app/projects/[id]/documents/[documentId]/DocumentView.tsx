'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Document, DOCUMENT_TYPES } from '@/lib/types'
import { MarkdownViewer } from '@/components/documents/MarkdownViewer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { ArrowLeft, Edit, Trash2, Clock, Download } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

interface DocumentViewProps {
  document: Document
  projectId: string
  projectName: string
}

export function DocumentView({ document, projectId, projectName }: DocumentViewProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  const typeConfig = DOCUMENT_TYPES[document.type]

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const supabase = getSupabase()

      const { error } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', document.id)

      if (error) throw error

      toast.success('Documento eliminado')
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Error al eliminar', {
        description: 'No se pudo eliminar el documento.'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = () => {
    // Convert HTML to approximate markdown (basic conversion)
    const markdown = document.content
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<code>(.*?)<\/code>/gi, '`$1`')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()

    const blob = new Blob([`# ${document.title}\n\n${markdown}`], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${document.title.toLowerCase().replace(/\s+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href={`/projects/${projectId}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{typeConfig.icon}</span>
              <h1 className="font-display font-bold text-3xl text-sloth-800">
                {document.title}
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary" className={cn('text-xs', typeConfig.color)}>
                {typeConfig.label}
              </Badge>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Actualizado {formatDate(document.updated_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Link href={`/projects/${projectId}/documents/${document.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El documento &quot;{document.title}&quot; será eliminado permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content */}
      <Card className="border-moss-100 shadow-sm">
        <CardContent className="p-8">
          <MarkdownViewer content={document.content} />
        </CardContent>
      </Card>

    </div>
  )
}
