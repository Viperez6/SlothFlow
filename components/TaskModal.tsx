'use client'

import { useState, useEffect } from 'react'
import { Task, TaskStatus } from '@/lib/types'
import { Trash2, FileText, Link as LinkIcon, Hash, Layers } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SlothSpinner } from '@/components/SlothLoader'
import { cn } from '@/lib/utils'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<Task>) => Promise<void>
  onDelete?: () => Promise<void>
  task?: Task | null
}

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task,
}: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [storyPoints, setStoryPoints] = useState<string>('')
  const [googleDocLink, setGoogleDocLink] = useState('')
  const [status, setStatus] = useState<TaskStatus>('backlog')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setStoryPoints(task.story_points?.toString() || '')
      setGoogleDocLink(task.google_doc_link || '')
      setStatus(task.status)
    } else {
      setTitle('')
      setDescription('')
      setStoryPoints('')
      setGoogleDocLink('')
      setStatus('backlog')
    }
    setShowDeleteConfirm(false)
  }, [task, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        story_points: storyPoints ? parseInt(storyPoints) : null,
        google_doc_link: googleDocLink.trim() || null,
        status,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    setDeleting(true)
    try {
      await onDelete()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  const statusConfig = {
    backlog: { label: 'Backlog', color: 'text-slate-600' },
    in_progress: { label: 'En Progreso', color: 'text-amber-600' },
    done: { label: 'Completado', color: 'text-moss-600' },
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-moss-100">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            {task ? (
              <>
                <FileText className="w-5 h-5 text-moss-500" />
                Editar Tarea
              </>
            ) : (
              <>
                <span className="text-2xl">🦥</span>
                Nueva Tarea
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {task
              ? 'Modifica los detalles de la tarea'
              : 'Crea una nueva tarea para tu proyecto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué necesitas hacer?"
              className="font-medium"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              Descripción
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agrega más detalles sobre la tarea..."
              rows={3}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* Story Points & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storyPoints" className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                Story Points
              </Label>
              <Input
                id="storyPoints"
                type="number"
                min="0"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                Estado
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Backlog
                    </span>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      En Progreso
                    </span>
                  </SelectItem>
                  <SelectItem value="done">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-moss-500" />
                      Completado
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Google Doc Link */}
          <div className="space-y-2">
            <Label htmlFor="googleDocLink" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-muted-foreground" />
              Enlace a Google Doc
            </Label>
            <Input
              id="googleDocLink"
              type="url"
              value={googleDocLink}
              onChange={(e) => setGoogleDocLink(e.target.value)}
              placeholder="https://docs.google.com/..."
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {/* Delete button */}
            {task && onDelete && (
              <div className="flex-1">
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">¿Seguro?</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? <SlothSpinner /> : 'Sí, eliminar'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleting || saving}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
            )}

            {/* Action buttons */}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving || deleting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || deleting || !title.trim()}
              className="bg-moss-gradient hover:opacity-90 text-white font-display font-semibold btn-premium"
            >
              {saving ? (
                <>
                  <SlothSpinner className="mr-2" />
                  Guardando...
                </>
              ) : task ? (
                'Guardar cambios'
              ) : (
                'Crear tarea'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
