'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Project } from '@/lib/types'
import { Plus, FolderOpen, Trash2, Calendar, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SlothPageLoader, SlothSpinner } from '@/components/SlothLoader'
import { Logo } from '@/components/Logo'
import { UserMenu } from '@/components/UserMenu'
import { cn } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      toast.error('Error al cargar proyectos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    setCreating(true)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Debes iniciar sesión')
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || null,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setProjects([data, ...projects])
      setShowModal(false)
      setNewProjectName('')
      setNewProjectDescription('')
      toast.success('Proyecto creado', {
        description: 'Tu nuevo proyecto está listo.',
      })
    } catch (error) {
      toast.error('Error al crear proyecto')
      console.error(error)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    setDeletingId(projectId)
    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      setProjects(projects.filter((p) => p.id !== projectId))
      toast.success('Proyecto eliminado')
    } catch (error) {
      toast.error('Error al eliminar proyecto')
      console.error(error)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return <SlothPageLoader message="Cargando tus proyectos" />
  }

  return (
    <div className="min-h-screen bg-organic-gradient">
      {/* Header */}
      <header className="bg-white/80 glass border-b border-moss-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <h1 className="text-2xl font-display font-bold text-sloth-800">SlothFlow</h1>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-display font-bold text-sloth-800">Tus Proyectos</h2>
            <p className="text-muted-foreground">Gestiona tus proyectos sin prisa</p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-moss-gradient hover:opacity-90 text-white font-display font-semibold btn-premium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="border-dashed border-2 border-moss-200 bg-white/50 animate-fade-in">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-moss-100 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-10 h-10 text-moss-400" />
              </div>
              <h3 className="text-xl font-display font-semibold text-sloth-700 mb-2">
                Sin proyectos aún
              </h3>
              <p className="text-muted-foreground mb-6">
                Crea tu primer proyecto para comenzar a organizar tus tareas
              </p>
              <Button
                onClick={() => setShowModal(true)}
                className="bg-moss-gradient hover:opacity-90 text-white font-display btn-premium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear mi primer proyecto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Card
                key={project.id}
                className={cn(
                  'group cursor-pointer overflow-hidden',
                  'border-moss-100 hover:border-moss-300',
                  'hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
                  'animate-fade-in opacity-0'
                )}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                {/* Decorative corner */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-moss-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />

                <CardHeader className="relative">
                  <CardTitle className="font-display text-xl group-hover:text-moss-700 transition-colors flex items-center justify-between">
                    {project.name}
                    <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-moss-500" />
                  </CardTitle>
                  {project.description && (
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardFooter className="flex items-center justify-between pt-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(project.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity',
                      'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('¿Seguro que quieres eliminar este proyecto?')) {
                        handleDeleteProject(project.id)
                      }
                    }}
                    disabled={deletingId === project.id}
                  >
                    {deletingId === project.id ? (
                      <SlothSpinner />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md border-moss-100">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <span className="text-2xl">🦥</span>
              Nuevo Proyecto
            </DialogTitle>
            <DialogDescription>
              Crea un nuevo espacio para organizar tus tareas
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Nombre del proyecto</Label>
              <Input
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Mi Proyecto Increíble"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription">Descripción (opcional)</Label>
              <Textarea
                id="projectDescription"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="¿De qué trata este proyecto?"
                rows={3}
                className="resize-none"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creating || !newProjectName.trim()}
                className="bg-moss-gradient hover:opacity-90 text-white font-display font-semibold btn-premium"
              >
                {creating ? (
                  <>
                    <SlothSpinner className="mr-2" />
                    Creando...
                  </>
                ) : (
                  'Crear proyecto'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
