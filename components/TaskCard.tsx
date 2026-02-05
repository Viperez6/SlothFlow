'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Draggable } from '@hello-pangea/dnd'
import { Task } from '@/lib/types'
import { Users, Loader2, FileText, Sparkles, GripVertical, Link as LinkIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

interface TaskCardProps {
  task: Task
  onClick: () => void
  index: number
  isDragEnabled?: boolean
  userRole: string | null
  hasDocument: boolean
  linksCount: number
}

export default function TaskCard({
  task,
  onClick,
  index,
  isDragEnabled = false,
  userRole,
  hasDocument,
  linksCount
}: TaskCardProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  const createVotingSession = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCreating(true)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Debes estar autenticado')
        return
      }

      const { data: session, error } = await supabase
        .from('voting_sessions')
        .insert({
          task_id: task.id,
          created_by: user.id,
          status: 'voting'
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/projects/${task.project_id}/voting/${session.id}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear sesión de votación')
    } finally {
      setIsCreating(false)
    }
  }

  const cardContent = (isDragging: boolean = false) => (
    <Card
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group cursor-pointer overflow-hidden transition-all duration-200',
        'border-moss-100 hover:border-moss-300',
        'hover:shadow-lg',
        isDragging && 'shadow-2xl rotate-2 scale-105 border-moss-400 bg-white',
        !isDragging && 'hover:-translate-y-1',
        isDragEnabled && 'cursor-grab active:cursor-grabbing'
      )}
    >
      {/* Drag indicator - show when drag is enabled */}
      {isDragEnabled && (
        <div
          className={cn(
            'absolute top-2 left-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
            'bg-moss-100/50',
            isDragging && 'opacity-100'
          )}
        >
          <GripVertical className="w-4 h-4 text-moss-400" />
        </div>
      )}

      {/* Decorative corner blob */}
      <div className={cn(
        'absolute -top-6 -right-6 w-16 h-16 bg-moss-100 rounded-full transition-all duration-500',
        isDragging ? 'opacity-70 scale-125' : 'opacity-50 group-hover:scale-150 group-hover:opacity-30'
      )} />

      <CardHeader className={cn("relative pb-2", isDragEnabled ? "pl-8" : "")}>
        <div className="flex items-start justify-between gap-3">
          <h4 className={cn(
            'font-display font-semibold text-lg text-sloth-800 transition-colors leading-tight',
            !isDragging && 'group-hover:text-moss-700'
          )}>
            {task.title}
          </h4>

          {/* Sloth icon for tasks without story points */}
          {task.story_points === null && (
            <span
              className={cn(
                "text-2xl transition-all duration-300 flex-shrink-0",
                (isHovered || isDragging) ? "animate-gentle-sway" : ""
              )}
            >
              🦥
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-muted-foreground text-sm mt-2 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </CardHeader>

      <CardContent className={cn("pt-0 pb-3", isDragEnabled ? "pl-8" : "")}>
        <div className="flex flex-wrap items-center gap-2">
          {task.story_points !== null && (
            <Badge
              variant="secondary"
              className="bg-moss-500 text-white hover:bg-moss-600 border-0 font-display font-bold px-3"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {task.story_points} SP
            </Badge>
          )}

          {hasDocument && (
            <Badge
              variant="outline"
              className="bg-earth-50 text-earth-700 border-earth-200"
            >
              <FileText className="w-3 h-3 mr-1" />
              Doc
            </Badge>
          )}

          {linksCount > 0 && (
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200"
            >
              <LinkIcon className="w-3 h-3 mr-1" />
              {linksCount}
            </Badge>
          )}
        </div>
      </CardContent>

      {/* PM Controls */}
      {userRole === 'pm' && (
        <CardFooter className={cn("pt-0 pb-4", isDragEnabled ? "pl-8" : "")}>
          <Button
            onClick={createVotingSession}
            disabled={isCreating}
            size="sm"
            className={cn(
              "w-full bg-moss-gradient hover:opacity-90 transition-opacity",
              "text-white font-display font-semibold",
              "btn-premium"
            )}
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Planning Poker
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )

  // Only render Draggable when drag is enabled (after client mount)
  if (!isDragEnabled) {
    return cardContent()
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          {cardContent(snapshot.isDragging)}
        </div>
      )}
    </Draggable>
  )
}
