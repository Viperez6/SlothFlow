'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Task, TaskStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { SupabaseClient } from '@supabase/supabase-js'

interface EditTaskFormProps {
  task: Task
  projectId: string
}

export function EditTaskForm({ task, projectId }: EditTaskFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [storyPoints, setStoryPoints] = useState(task.story_points?.toString() || '')
  const [status, setStatus] = useState<TaskStatus>(task.status)
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
      toast.error('El título es requerido')
      return
    }

    setIsSaving(true)
    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('tasks')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          story_points: storyPoints ? parseInt(storyPoints) : null,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id)

      if (error) throw error

      toast.success('Tarea actualizada')
      router.push(`/projects/${projectId}/tasks/${task.id}`)
    } catch (error) {
      console.error('Error saving task:', error)
      toast.error('Error al guardar', {
        description: 'No se pudo actualizar la tarea.'
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
          <Link href={`/projects/${projectId}/tasks/${task.id}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display font-bold text-3xl text-sloth-800">
              Editar Tarea
            </h1>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/projects/${projectId}/tasks/${task.id}`}>
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
            Guardar
          </Button>
        </div>
      </div>

      {/* Form */}
      <Card className="border-moss-100 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl">Detalles de la tarea</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre de la tarea"
              className="border-moss-200"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Markdown)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la tarea, criterios de aceptación, etc..."
              rows={6}
              className="border-moss-200 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Soporta Markdown: **negrita**, *cursiva*, - listas, ## títulos
            </p>
          </div>

          {/* Story Points & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storyPoints">Story Points</Label>
              <Input
                id="storyPoints"
                type="number"
                min="0"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                placeholder="0"
                className="border-moss-200"
              />
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="border-moss-200">
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
        </CardContent>
      </Card>
    </div>
  )
}
