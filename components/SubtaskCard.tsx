'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Draggable } from '@hello-pangea/dnd'
import { Subtask, SubtaskType, SUBTASK_TYPES, Profile, SLOTH_AVATARS, SlothAvatarId } from '@/lib/types'
import { Loader2, Sparkles, GripVertical, SquareStack } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SlothAvatarDisplay } from '@/components/SlothAvatarSelector'
import type { SupabaseClient } from '@supabase/supabase-js'

interface SubtaskCardProps {
  subtask: Subtask
  onClick: () => void
  index: number
  isDragEnabled?: boolean
  userRole: string | null
  projectId: string
  assignee?: Profile | null
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*_]{3,}\s*$/gm, '')
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default function SubtaskCard({
  subtask,
  onClick,
  index,
  isDragEnabled = false,
  userRole,
  projectId,
  assignee,
}: SubtaskCardProps) {
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
          subtask_id: subtask.id,
          created_by: user.id,
          status: 'voting'
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/projects/${projectId}/voting/${session.id}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear sesion de votacion')
    } finally {
      setIsCreating(false)
    }
  }

  const needsEstimation = subtask.story_points === null || subtask.story_points === 0
  const cleanDescription = subtask.description ? stripMarkdown(subtask.description) : null
  const typeConfig = SUBTASK_TYPES[subtask.type]

  const cardContent = (isDragging: boolean = false) => (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-white rounded-xl border cursor-pointer',
        'transition-all duration-200 ease-out',
        'border-gray-100 shadow-sm',
        'hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5',
        isDragging && 'shadow-xl rotate-1 scale-[1.02] border-gray-300 ring-2 ring-gray-200/50',
        isDragEnabled && 'cursor-grab active:cursor-grabbing'
      )}
    >
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

      <div className={cn('p-4', isDragEnabled && 'pl-7')}>
        {/* Header: Type badge + Title */}
        <div className="flex items-start gap-2 mb-2">
          <Badge className={cn('text-[10px] px-1.5 py-0 border-0 flex-shrink-0', typeConfig.color)}>
            {typeConfig.icon} {typeConfig.label}
          </Badge>
          {needsEstimation && (
            <span className="text-lg flex-shrink-0 ml-auto" title="Sin estimar">
              🦥
            </span>
          )}
        </div>

        <h4 className={cn(
          'font-medium text-gray-900 leading-snug mb-1',
          'group-hover:text-gray-700 transition-colors'
        )}>
          {subtask.title}
        </h4>

        {cleanDescription && (
          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-3">
            {cleanDescription}
          </p>
        )}

        {/* Bottom row: SP, Hours, Assignee */}
        <div className="flex flex-wrap items-center gap-1.5">
          {subtask.story_points !== null && subtask.story_points > 0 && (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 border-0 text-xs font-semibold px-2 py-0.5">
              <Sparkles className="w-3 h-3 mr-1" />
              {subtask.story_points} SP
            </Badge>
          )}

          {/* Spacer to push assignee to the right */}
          <div className="flex-1" />

          {assignee && (
            <div className="flex items-center gap-1" title={assignee.full_name || assignee.email || ''}>
              <SlothAvatarDisplay avatarId={assignee.avatar} size="xs" />
            </div>
          )}
        </div>

        {/* PM Controls - Estimar */}
        {userRole === 'pm' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button
              onClick={createVotingSession}
              disabled={isCreating}
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-full relative',
                'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                'font-normal text-sm'
              )}
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <SquareStack className="w-4 h-4 absolute left-3" />
                  <span className="w-full text-center">
                    {needsEstimation ? 'Estimar' : 'Re-estimar'}
                  </span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  if (!isDragEnabled) {
    return cardContent()
  }

  return (
    <Draggable draggableId={subtask.id} index={index}>
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
