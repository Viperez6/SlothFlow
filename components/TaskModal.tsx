'use client'

import { useState, useEffect, useRef } from 'react'
import { Task, TaskStatus, TaskLink, LINK_TYPES, LinkType } from '@/lib/types'
import { Trash2, FileText, Link as LinkIcon, Hash, Layers, Plus, ExternalLink, X } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SlothSpinner } from '@/components/SlothLoader'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

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
  const [status, setStatus] = useState<TaskStatus>('backlog')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Links state
  const [links, setLinks] = useState<TaskLink[]>([])
  const [loadingLinks, setLoadingLinks] = useState(false)
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

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setStoryPoints(task.story_points?.toString() || '')
      setStatus(task.status)
      loadTaskLinks(task.id)
    } else {
      setTitle('')
      setDescription('')
      setStoryPoints('')
      setStatus('backlog')
      setLinks([])
    }
    setShowDeleteConfirm(false)
    setShowAddLink(false)
  }, [task, isOpen])

  const loadTaskLinks = async (taskId: string) => {
    setLoadingLinks(true)
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('task_links')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setLinks(data)
      }
    } catch (error) {
      console.error('Error loading links:', error)
    } finally {
      setLoadingLinks(false)
    }
  }

  const handleAddLink = async () => {
    if (!task || !newLinkUrl.trim()) return

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

      if (!error && data) {
        setLinks(prev => [data, ...prev])
        setNewLinkUrl('')
        setNewLinkTitle('')
        setNewLinkType('external')
        setShowAddLink(false)
      }
    } catch (error) {
      console.error('Error adding link:', error)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('task_links')
        .delete()
        .eq('id', linkId)

      if (!error) {
        setLinks(prev => prev.filter(l => l.id !== linkId))
      }
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        story_points: storyPoints ? parseInt(storyPoints) : null,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-moss-100 max-h-[90vh] overflow-y-auto">
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
              placeholder="Agrega más detalles sobre la tarea (soporta Markdown)..."
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

          {/* Links Section - Only shown when editing */}
          {task && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    Enlaces externos
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddLink(!showAddLink)}
                    className="h-7 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Agregar
                  </Button>
                </div>

                {/* Add link form */}
                {showAddLink && (
                  <div className="space-y-2 p-3 bg-moss-50 rounded-lg">
                    <Input
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        placeholder="Título (opcional)"
                        className="text-sm"
                      />
                      <Select value={newLinkType} onValueChange={(v) => setNewLinkType(v as LinkType)}>
                        <SelectTrigger className="text-sm">
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddLink(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddLink}
                        disabled={!newLinkUrl.trim()}
                        className="bg-moss-600 hover:bg-moss-700 text-white"
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Links list */}
                {loadingLinks ? (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    Cargando enlaces...
                  </div>
                ) : links.length > 0 ? (
                  <div className="space-y-2">
                    {links.map(link => {
                      const typeConfig = LINK_TYPES[link.type]
                      return (
                        <div
                          key={link.id}
                          className="flex items-center gap-2 p-2 bg-white rounded-lg border border-moss-100 group"
                        >
                          <span className="text-sm">{typeConfig.icon}</span>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 truncate text-sm hover:text-moss-600 transition-colors"
                          >
                            {link.title || link.url}
                          </a>
                          <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLink(link.id)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Sin enlaces
                  </p>
                )}
              </div>
            </>
          )}

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
