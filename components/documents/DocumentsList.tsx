'use client'

import { useState, useEffect, useRef } from 'react'
import { Document, DOCUMENT_TYPES, DocumentType } from '@/lib/types'
import { DocumentCard } from './DocumentCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import { Plus, Search, FileText, Filter } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

interface DocumentsListProps {
  projectId: string
  initialDocuments?: Document[]
}

export function DocumentsList({ projectId, initialDocuments = [] }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [loading, setLoading] = useState(!initialDocuments.length)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all')
  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    if (initialDocuments.length) return

    async function loadDocuments() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from('project_documents')
          .select('*')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false })

        if (error) throw error

        setDocuments(data || [])
      } catch (error) {
        console.error('Error loading documents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [projectId, initialDocuments.length])

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || doc.type === filterType
    return matchesSearch && matchesType
  })

  // Group by type for counts
  const typeCounts = documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton header */}
        <div className="flex justify-between items-center">
          <div className="h-10 w-64 bg-moss-100 rounded-lg animate-pulse" />
          <div className="h-10 w-40 bg-moss-100 rounded-lg animate-pulse" />
        </div>
        {/* Skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-moss-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-moss-200"
          />
        </div>

        <Link href={`/projects/${projectId}/documents/new`}>
          <Button className="bg-moss-gradient text-white hover:opacity-90 font-display font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Documento
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className={cn(
            'cursor-pointer transition-colors',
            filterType === 'all' ? 'bg-moss-100 border-moss-300 text-moss-700' : 'hover:bg-moss-50'
          )}
          onClick={() => setFilterType('all')}
        >
          <Filter className="w-3 h-3 mr-1" />
          Todos ({documents.length})
        </Badge>
        {(Object.keys(DOCUMENT_TYPES) as DocumentType[]).map(type => {
          const config = DOCUMENT_TYPES[type]
          const count = typeCounts[type] || 0
          if (count === 0) return null

          return (
            <Badge
              key={type}
              variant="outline"
              className={cn(
                'cursor-pointer transition-colors',
                filterType === type ? config.color : 'hover:bg-moss-50'
              )}
              onClick={() => setFilterType(type)}
            >
              <span className="mr-1">{config.icon}</span>
              {config.label} ({count})
            </Badge>
          )
        })}
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => (
            <DocumentCard key={doc.id} document={doc} projectId={projectId} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/60 rounded-2xl border border-moss-100">
          <div className="w-20 h-20 rounded-full bg-moss-100 flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-moss-400" />
          </div>
          <h3 className="font-display font-semibold text-xl text-sloth-800 mb-2">
            {searchQuery || filterType !== 'all' ? 'No se encontraron documentos' : 'Sin documentos aún'}
          </h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            {searchQuery || filterType !== 'all'
              ? 'Intenta con otra búsqueda o filtro'
              : 'Crea tu primer documento para empezar a organizar la información del proyecto'}
          </p>
          {!searchQuery && filterType === 'all' && (
            <Link href={`/projects/${projectId}/documents/new`}>
              <Button className="bg-moss-gradient text-white hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Crear Documento
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
