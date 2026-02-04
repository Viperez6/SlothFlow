'use client'

import { Document, DOCUMENT_TYPES } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FileText, Clock, LinkIcon } from 'lucide-react'
import Link from 'next/link'

interface DocumentCardProps {
  document: Document & { task_count?: number }
  projectId: string
}

export function DocumentCard({ document, projectId }: DocumentCardProps) {
  const typeConfig = DOCUMENT_TYPES[document.type]

  // Extract plain text preview from HTML content
  const getPreview = (html: string): string => {
    const text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text.length > 120 ? text.slice(0, 120) + '...' : text
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Link href={`/projects/${projectId}/documents/${document.id}`}>
      <Card className={cn(
        'group cursor-pointer overflow-hidden transition-all duration-200',
        'border-moss-100 hover:border-moss-300',
        'hover:shadow-lg hover:-translate-y-1'
      )}>
        {/* Type indicator bar */}
        <div className={cn(
          'h-1',
          document.type === 'prd' && 'bg-blue-400',
          document.type === 'spec' && 'bg-purple-400',
          document.type === 'meeting_notes' && 'bg-amber-400',
          document.type === 'retrospective' && 'bg-moss-400',
          document.type === 'general' && 'bg-slate-400'
        )} />

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{typeConfig.icon}</span>
              <h4 className="font-display font-semibold text-lg text-sloth-800 group-hover:text-moss-700 transition-colors line-clamp-1">
                {document.title}
              </h4>
            </div>
            <Badge variant="secondary" className={cn('text-xs shrink-0', typeConfig.color)}>
              {typeConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Preview */}
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3 min-h-[40px]">
            {getPreview(document.content) || 'Sin contenido'}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(document.updated_at)}</span>
            </div>

            {document.task_count !== undefined && document.task_count > 0 && (
              <div className="flex items-center gap-1 text-moss-600">
                <LinkIcon className="w-3 h-3" />
                <span>{document.task_count} tarea{document.task_count !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
