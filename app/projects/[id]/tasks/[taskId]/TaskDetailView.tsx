'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Task, TaskDocument, TaskLink, LINK_TYPES, LinkType } from '@/lib/types'
import { MarkdownViewer } from '@/components/documents/MarkdownViewer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  ArrowLeft, Edit, Trash2, FileText, Link as LinkIcon,
  ExternalLink, Plus, Clock, X, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

interface TaskDetailViewProps {
  task: Task
  taskDocument: TaskDocument | null
  taskLinks: TaskLink[]
  projectId: string
  projectName: string
}

export function TaskDetailView({
  task,
  taskDocument: initialDocument,
  taskLinks: initialLinks,
  projectId,
  projectName
}: TaskDetailViewProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [taskDocument, setTaskDocument] = useState<TaskDocument | null>(initialDocument)
  const [taskLinks, setTaskLinks] = useState<TaskLink[]>(initialLinks)

  // Add link form state
  const [showAddLink, setShowAddLink] = useState(false)
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkType, setNewLinkType] = useState<LinkType>('external')

  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  const statusConfig = {
    backlog: { label: 'Backlog', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
    in_progress: { label: 'En Progreso', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
    done: { label: 'Completado', color: 'bg-moss-100 text-moss-700', dot: 'bg-moss-500' },
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleDeleteTask = async () => {
    setIsDeleting(true)
    try {
      const supabase = getSupabase()

      // Delete related task_links
      await supabase
        .from('task_links')
        .delete()
        .eq('task_id', task.id)

      // Delete related task_document if exists
      await supabase
        .from('task_documents')
        .delete()
        .eq('task_id', task.id)

      // Delete task
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)

      if (error) throw error

      toast.success('Tarea eliminada')
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Error al eliminar', {
        description: 'No se pudo eliminar la tarea.'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddLink = async () => {
    if (!newLinkUrl.trim()) return

    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('task_links')
        .insert({
          task_id: task.id,
          url: newLinkUrl.trim(),
          title: newLinkTitle.trim() || null,
          type: newLinkType,
        })
        .select()
        .single()

      if (error) throw error

      setTaskLinks(prev => [data, ...prev])
      setNewLinkUrl('')
      setNewLinkTitle('')
      setNewLinkType('external')
      setShowAddLink(false)
      toast.success('Link agregado')
    } catch (error) {
      console.error('Error adding link:', error)
      toast.error('Error al agregar link')
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('task_links')
        .delete()
        .eq('id', linkId)

      if (error) throw error

      setTaskLinks(prev => prev.filter(l => l.id !== linkId))
      toast.success('Link eliminado')
    } catch (error) {
      console.error('Error deleting link:', error)
      toast.error('Error al eliminar link')
    }
  }

  const handleDeleteDocument = async () => {
    if (!taskDocument) return

    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('task_documents')
        .delete()
        .eq('id', taskDocument.id)

      if (error) throw error

      setTaskDocument(null)
      toast.success('Documento eliminado')
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Error al eliminar documento')
    }
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
              <span className="text-3xl">🦥</span>
              <h1 className="font-display font-bold text-3xl text-sloth-800">
                {task.title}
              </h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge className={cn('text-xs', statusConfig[task.status].color)}>
                <span className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig[task.status].dot)} />
                {statusConfig[task.status].label}
              </Badge>
              {task.story_points && (
                <Badge className="bg-moss-500 text-white border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {task.story_points} SP
                </Badge>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Actualizado {formatDate(task.updated_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/projects/${projectId}/tasks/${task.id}/edit`}>
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
                <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. La tarea &quot;{task.title}&quot; y todo su contenido será eliminado permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTask}
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

      {/* LEVEL 1: Description (always present) */}
      <Card className="border-moss-100 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">📝</span>
            Descripción
          </h2>
          {task.description ? (
            <div className="prose prose-slate max-w-none">
              <MarkdownViewer content={task.description} />
            </div>
          ) : (
            <p className="text-muted-foreground italic">
              Sin descripción. Edita la tarea para agregar una descripción.
            </p>
          )}
        </CardContent>
      </Card>

      {/* LEVEL 2: Detailed Document (optional 1:1) - Compact section */}
      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-moss-100">
        <span className="text-lg">📄</span>
        {taskDocument ? (
          <>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{taskDocument.title}</p>
              <p className="text-xs text-muted-foreground">
                Actualizado {formatDate(taskDocument.updated_at)}
              </p>
            </div>
            <div className="flex gap-1.5">
              <Link href={`/projects/${projectId}/tasks/${task.id}/document`}>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Ver
                </Button>
              </Link>
              <Link href={`/projects/${projectId}/tasks/${task.id}/document/edit`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteDocument}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        ) : (
          <>
            <p className="flex-1 text-sm text-muted-foreground">
              Sin documento detallado
            </p>
            <Link href={`/projects/${projectId}/tasks/${task.id}/document/new`}>
              <Button variant="ghost" size="sm" className="h-8">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Crear
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* LEVEL 3: Links (optional 1:N) - Compact section */}
      <div className="p-3 bg-white/60 rounded-lg border border-moss-100">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-lg">🔗</span>
          <p className="flex-1 text-sm text-muted-foreground">
            Links {taskLinks.length > 0 && <span className="font-medium text-sloth-700">({taskLinks.length})</span>}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => setShowAddLink(!showAddLink)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Agregar
          </Button>
        </div>

        {/* Add link form */}
        {showAddLink && (
          <div className="space-y-2 pt-3 mt-3 border-t border-moss-100">
            <Input
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://..."
              className="bg-white h-8 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="Título (opcional)"
                className="bg-white h-8 text-sm"
              />
              <Select value={newLinkType} onValueChange={(v) => setNewLinkType(v as LinkType)}>
                <SelectTrigger className="bg-white h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(LINK_TYPES) as LinkType[]).map(type => {
                    const config = LINK_TYPES[type]
                    return (
                      <SelectItem key={type} value={type}>
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
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowAddLink(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs bg-moss-600 hover:bg-moss-700 text-white"
                onClick={handleAddLink}
                disabled={!newLinkUrl.trim()}
              >
                Agregar
              </Button>
            </div>
          </div>
        )}

        {/* Links list */}
        {taskLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-moss-100">
            {taskLinks.map(link => {
              const typeConfig = LINK_TYPES[link.type]
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-md border border-moss-100 hover:border-moss-300 transition-colors text-sm"
                >
                  <span>{typeConfig.icon}</span>
                  <span className="text-moss-700 font-medium truncate max-w-[150px]">
                    {link.title || new URL(link.url).hostname}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDeleteLink(link.id)
                    }}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
