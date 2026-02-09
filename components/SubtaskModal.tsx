'use client'

import { useState, useEffect } from 'react'
import { Subtask, SubtaskStatus, SubtaskType, SUBTASK_TYPES, Profile } from '@/lib/types'
import { Trash2, FileText, Layers, Hash, User, Wrench } from 'lucide-react'
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
import { SlothAvatarDisplay } from '@/components/SlothAvatarSelector'
import { cn } from '@/lib/utils'

interface SubtaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (subtask: Partial<Subtask>) => Promise<void>
  onDelete?: () => Promise<void>
  subtask?: Subtask | null
  defaultStatus?: SubtaskStatus
  teamMembers: Profile[]
}

export default function SubtaskModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  subtask,
  defaultStatus = 'backlog',
  teamMembers,
}: SubtaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<SubtaskStatus>('backlog')
  const [type, setType] = useState<SubtaskType>('other')
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [storyPoints, setStoryPoints] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (subtask) {
      setTitle(subtask.title)
      setDescription(subtask.description || '')
      setStatus(subtask.status)
      setType(subtask.type)
      setAssignedTo(subtask.assigned_to || 'unassigned')
      setStoryPoints(subtask.story_points?.toString() || '')
    } else {
      setTitle('')
      setDescription('')
      setStatus(defaultStatus)
      setType('other')
      setAssignedTo('unassigned')
      setStoryPoints('')
    }
    setShowDeleteConfirm(false)
  }, [subtask, isOpen, defaultStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        status,
        type,
        assigned_to: assignedTo === 'unassigned' ? null : assignedTo,
        story_points: storyPoints ? parseInt(storyPoints) : null,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-moss-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            {subtask ? (
              <>
                <Wrench className="w-5 h-5 text-moss-500" />
                Editar Subtarea
              </>
            ) : (
              <>
                <span className="text-2xl">🦥</span>
                Nueva Subtarea
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {subtask
              ? 'Modifica los detalles de la subtarea'
              : 'Define una subtarea tecnica'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Titulo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Implementar..."
              className="font-medium"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              Descripcion
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles tecnicos de la subtarea (soporta Markdown)..."
              rows={3}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                Tipo
              </Label>
              <Select value={type} onValueChange={(v) => setType(v as SubtaskType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(SUBTASK_TYPES) as [SubtaskType, typeof SUBTASK_TYPES[SubtaskType]][]).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span>{config.icon}</span>
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                Estado
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as SubtaskStatus)}>
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

          {/* Assigned To */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Asignado a
            </Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  <span className="text-muted-foreground">Sin asignar</span>
                </SelectItem>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    <span className="flex items-center gap-2">
                      <SlothAvatarDisplay avatarId={member.avatar} size="xs" />
                      {member.full_name || member.email}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Story Points */}
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

          <DialogFooter className="gap-2 sm:gap-0">
            {subtask && onDelete && (
              <div className="flex-1">
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">¿Seguro?</span>
                    <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                      {deleting ? <SlothSpinner /> : 'Si, eliminar'}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
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

            <Button type="button" variant="outline" onClick={onClose} disabled={saving || deleting}>
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
              ) : subtask ? (
                'Guardar cambios'
              ) : (
                'Crear subtarea'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
