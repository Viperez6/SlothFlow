'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Draggable } from '@hello-pangea/dnd'
import { Task } from '@/lib/types'
import { Loader2, FileText, Sparkles, GripVertical, Link as LinkIcon, SquareStack } from 'lucide-react'
import { createClient } from '@/lib/supabase'
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

/**
 * Strips markdown syntax from text for clean preview display
 */
function stripMarkdown(text: string): string {
  return text
    // Remove headers (## Header)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic (**text**, *text*, __text__, _text_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove inline code (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
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

  const needsEstimation = task.story_points === null || task.story_points === 0
  const cleanDescription = task.description ? stripMarkdown(task.description) : null

  const cardContent = (isDragging: boolean = false) => (
    <div
      onClick={onClick}
      className={cn(
        // Base styles - clean, minimal
        'group relative bg-white rounded-xl border cursor-pointer',
        'transition-all duration-200 ease-out',

        // Default state
        'border-gray-100 shadow-sm',

        // Hover state
        'hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5',

        // Dragging state
        isDragging && 'shadow-xl rotate-1 scale-[1.02] border-gray-300 ring-2 ring-gray-200/50',

        // Drag enabled cursor
        isDragEnabled && 'cursor-grab active:cursor-grabbing'
      )}
    >
      {/* Drag Handle - subtle, appears on hover */}
      {isDragEnabled && (
        <div
          className={cn(
            'absolute top-3 left-2 p-0.5 rounded transition-opacity',
            'opacity-0 group-hover:opacity-60',
            isDragging && 'opacity-80'
          )}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Card Content */}
      <div className={cn('p-4', isDragEnabled && 'pl-7')}>

        {/* Header: Title + Sloth indicator */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className={cn(
            'font-medium text-gray-900 leading-snug',
            'group-hover:text-gray-700 transition-colors'
          )}>
            {task.title}
          </h4>

          {/* Sloth indicator for unestimated tasks */}
          {needsEstimation && (
            <span className="text-xl flex-shrink-0" title="Sin estimar">
              🦥
            </span>
          )}
        </div>

        {/* Description Preview - cleaned markdown */}
        {cleanDescription && (
          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-3">
            {cleanDescription}
          </p>
        )}

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Story Points Badge - prominent green */}
          {task.story_points !== null && task.story_points > 0 && (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 border-0 text-xs font-semibold px-2 py-0.5">
              <Sparkles className="w-3 h-3 mr-1" />
              {task.story_points} SP
            </Badge>
          )}

          {/* Document Badge - subtle outline */}
          {hasDocument && (
            <Badge
              variant="outline"
              className="bg-amber-50/80 text-amber-700 border-amber-200/80 text-xs px-2 py-0.5"
            >
              <FileText className="w-3 h-3 mr-1" />
              Doc
            </Badge>
          )}

          {/* Links Badge - subtle outline */}
          {linksCount > 0 && (
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-600 border-slate-200 text-xs px-2 py-0.5"
            >
              <LinkIcon className="w-3 h-3 mr-1" />
              {linksCount}
            </Badge>
          )}
        </div>

        {/* PM Controls - Planning Poker buttons */}
        {userRole === 'pm' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {needsEstimation ? (
              // Ghost button for estimation - subtle, text-link style
              <Button
                onClick={createVotingSession}
                disabled={isCreating}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 px-2 w-full justify-center',
                  'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                  'font-normal text-sm'
                )}
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <SquareStack className="w-4 h-4 mr-2" />
                    Estimar (Planning Poker)
                  </>
                )}
              </Button>
            ) : (
              // Filled secondary button for re-estimation
              <Button
                onClick={createVotingSession}
                disabled={isCreating}
                size="sm"
                className={cn(
                  'h-7 px-3',
                  'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  'border-0 shadow-none',
                  'font-normal text-xs'
                )}
              >
                {isCreating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <SquareStack className="w-3 h-3 mr-1.5" />
                    Re-estimar
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
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
          style={provided.draggableProps.style}
        >
          {cardContent(snapshot.isDragging)}
        </div>
      )}
    </Draggable>
  )
}
