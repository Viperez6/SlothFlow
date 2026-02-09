'use client'

import { useState, useEffect, useRef } from 'react'
import { UserStory, UserStoryPriority, AcceptanceCriterion, UserStoryLink, UserStoryDocument, USER_STORY_PRIORITIES, LINK_TYPES, LinkType } from '@/lib/types'
import Link from 'next/link'
import { Trash2, FileText, Link as LinkIcon, Layers, Plus, ExternalLink, X, Edit, CheckSquare, GripVertical, BookOpen } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
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

interface UserStoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (story: Partial<UserStory>, criteria: { description: string; is_completed: boolean }[]) => Promise<void>
  onDelete?: () => Promise<void>
  userStory?: UserStory | null
  projectId: string
}

export default function UserStoryModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  userStory,
  projectId,
}: UserStoryModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<UserStoryPriority>('medium')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Acceptance criteria
  const [criteria, setCriteria] = useState<{ id?: string; description: string; is_completed: boolean }[]>([])
  const [newCriterion, setNewCriterion] = useState('')

  // Document state
  const [storyDocument, setStoryDocument] = useState<UserStoryDocument | null>(null)

  // Links state
  const [links, setLinks] = useState<UserStoryLink[]>([])
  const [loadingData, setLoadingData] = useState(false)
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
    if (userStory) {
      setTitle(userStory.title)
      setDescription(userStory.description || '')
      setPriority(userStory.priority)
      loadStoryData(userStory.id)
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setCriteria([])
      setLinks([])
      setStoryDocument(null)
    }
    setShowDeleteConfirm(false)
    setShowAddLink(false)
  }, [userStory, isOpen])

  const loadStoryData = async (storyId: string) => {
    setLoadingData(true)
    try {
      const supabase = getSupabase()

      // Load acceptance criteria
      const { data: criteriaData } = await supabase
        .from('acceptance_criteria')
        .select('*')
        .eq('user_story_id', storyId)
        .order('sort_order', { ascending: true })

      setCriteria((criteriaData || []).map(c => ({
        id: c.id,
        description: c.description,
        is_completed: c.is_completed,
      })))

      // Load document
      const { data: docData } = await supabase
        .from('user_story_documents')
        .select('*')
        .eq('user_story_id', storyId)
        .maybeSingle()

      setStoryDocument(docData)

      // Load links
      const { data: linksData } = await supabase
        .from('user_story_links')
        .select('*')
        .eq('user_story_id', storyId)
        .order('created_at', { ascending: false })

      setLinks(linksData || [])
    } catch (error) {
      console.error('Error loading story data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleAddCriterion = () => {
    if (!newCriterion.trim()) return
    setCriteria(prev => [...prev, { description: newCriterion.trim(), is_completed: false }])
    setNewCriterion('')
  }

  const handleRemoveCriterion = (index: number) => {
    setCriteria(prev => prev.filter((_, i) => i !== index))
  }

  const handleToggleCriterion = (index: number) => {
    setCriteria(prev => prev.map((c, i) =>
      i === index ? { ...c, is_completed: !c.is_completed } : c
    ))
  }

  const handleAddLink = async () => {
    if (!userStory || !newLinkUrl.trim()) return

    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('user_story_links')
        .insert({
          user_story_id: userStory.id,
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
        .from('user_story_links')
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
      await onSave(
        {
          title: title.trim(),
          description: description.trim() || null,
          priority,
        },
        criteria.map(c => ({ description: c.description, is_completed: c.is_completed }))
      )
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

  const completedCriteria = criteria.filter(c => c.is_completed).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-moss-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            {userStory ? (
              <>
                <BookOpen className="w-5 h-5 text-moss-500" />
                Editar Historia de Usuario
              </>
            ) : (
              <>
                <span className="text-2xl">🦥</span>
                Nueva Historia de Usuario
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {userStory
              ? 'Modifica los detalles de la historia de usuario'
              : 'Define una historia de usuario con criterios de aceptacion'}
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
              placeholder="Como usuario quiero..."
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
              placeholder="Describe el valor de negocio y contexto (soporta Markdown)..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Prioridad
            </Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as UserStoryPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(USER_STORY_PRIORITIES) as [UserStoryPriority, typeof USER_STORY_PRIORITIES[UserStoryPriority]][]).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full', config.dot)} />
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Acceptance Criteria */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-muted-foreground" />
              Criterios de Aceptacion
              {criteria.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {completedCriteria}/{criteria.length}
                </Badge>
              )}
            </Label>

            {/* Existing criteria */}
            <div className="space-y-2">
              {criteria.map((criterion, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group">
                  <Checkbox
                    checked={criterion.is_completed}
                    onCheckedChange={() => handleToggleCriterion(index)}
                  />
                  <span className={cn(
                    'flex-1 text-sm',
                    criterion.is_completed && 'line-through text-muted-foreground'
                  )}>
                    {criterion.description}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCriterion(index)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add criterion */}
            <div className="flex gap-2">
              <Input
                value={newCriterion}
                onChange={(e) => setNewCriterion(e.target.value)}
                placeholder="Agregar criterio de aceptacion..."
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCriterion()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCriterion}
                disabled={!newCriterion.trim()}
                className="flex-shrink-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Document & Links Section - Only shown when editing */}
          {userStory && projectId && (
            <>
              <Separator />

              {/* Document */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Documento detallado
                </Label>
                {loadingData ? (
                  <p className="text-sm text-muted-foreground">Cargando...</p>
                ) : storyDocument ? (
                  <div className="flex items-center gap-2 p-2 bg-moss-50 rounded-lg border border-moss-100">
                    <span className="text-sm">📄</span>
                    <span className="flex-1 text-sm font-medium truncate">{storyDocument.title}</span>
                    <Link href={`/projects/${projectId}/stories/${userStory.id}/document`} onClick={onClose}>
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                        Ver
                      </Button>
                    </Link>
                    <Link href={`/projects/${projectId}/stories/${userStory.id}/document/edit`} onClick={onClose}>
                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href={`/projects/${projectId}/stories/${userStory.id}/document/new`} onClick={onClose}>
                    <Button type="button" variant="outline" size="sm" className="w-full text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Crear documento detallado
                    </Button>
                  </Link>
                )}
              </div>

              <Separator />

              {/* Links */}
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
                        placeholder="Titulo (opcional)"
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
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddLink(false)}>
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

                {loadingData ? (
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
            {userStory && onDelete && (
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
              ) : userStory ? (
                'Guardar cambios'
              ) : (
                'Crear historia'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
