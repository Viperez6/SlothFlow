'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Task, TaskDocument } from '@/lib/types'
import { MarkdownViewer } from '@/components/documents/MarkdownViewer'
import { Button } from '@/components/ui/button'
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
import type { SupabaseClient } from '@supabase/supabase-js'

interface TaskDocumentViewProps {
  task: Task
  taskDocument: TaskDocument
  projectId: string
}

export function TaskDocumentView({ task, taskDocument, projectId }: TaskDocumentViewProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

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
        .from('task_documents')
        .delete()
        .eq('id', taskDocument.id)

      if (error) throw error

      toast.success('Documento eliminado')
      router.push(`/projects/${projectId}/tasks/${task.id}`)
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Error al eliminar documento')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = () => {
    // Convert HTML to approximate markdown
    const markdown = taskDocument.content
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

    const markdownBlob = new Blob([`# ${taskDocument.title}\n\n${markdown}`], { type: 'text/markdown' })
    const blobUrl = URL.createObjectURL(markdownBlob)
    const downloadLink = window.document.createElement('a')
    downloadLink.href = blobUrl
    downloadLink.download = `${taskDocument.title.toLowerCase().replace(/\s+/g, '-')}.md`
    downloadLink.click()
    URL.revokeObjectURL(blobUrl)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href={`/projects/${projectId}/tasks/${task.id}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Documento de: {task.title}
            </p>
            <h1 className="font-display font-bold text-3xl text-sloth-800 flex items-center gap-3">
              <span className="text-2xl">📄</span>
              {taskDocument.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Actualizado {formatDate(taskDocument.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Link href={`/projects/${projectId}/tasks/${task.id}/document/edit`}>
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
                  Esta acción no se puede deshacer. El documento será eliminado permanentemente.
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
          <MarkdownViewer content={taskDocument.content} />
        </CardContent>
      </Card>
    </div>
  )
}
