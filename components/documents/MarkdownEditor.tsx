'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import { common, createLowlight } from 'lowlight'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Bold, Italic, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare,
  Quote, FileCode, Table as TableIcon,
  Link as LinkIcon, Eye, Undo, Redo
} from 'lucide-react'
import { useCallback, useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

const lowlight = createLowlight(common)

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  autoSave?: boolean
  onSave?: () => void
  minHeight?: string
}

export function MarkdownEditor({
  content,
  onChange,
  placeholder = 'Comienza a escribir...',
  className,
  autoSave = false,
  onSave,
  minHeight = '400px'
}: MarkdownEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const lastSavedContent = useRef(content)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-moss-600 underline hover:text-moss-800',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-slate max-w-none focus:outline-none p-6`,
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  // Auto-save con debounce de 3 segundos
  useEffect(() => {
    if (!autoSave || !onSave || !editor) return

    const currentContent = editor.getHTML()
    if (currentContent === lastSavedContent.current) return

    const timer = setTimeout(() => {
      setIsSaving(true)
      onSave()
      lastSavedContent.current = currentContent
      setTimeout(() => setIsSaving(false), 1000)
    }, 3000)

    return () => clearTimeout(timer)
  }, [content, autoSave, onSave, editor])

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href || ''
    const url = window.prompt('URL:', previousUrl)

    if (url === null) return

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  if (!editor) {
    return (
      <div className={cn('border rounded-lg overflow-hidden animate-pulse', className)}>
        <div className="border-b bg-white p-2 h-12" />
        <div className="bg-white p-6" style={{ minHeight }} />
      </div>
    )
  }

  return (
    <div className={cn('border border-moss-200 rounded-xl overflow-hidden shadow-sm', className)}>
      {/* Toolbar */}
      <div className="border-b border-moss-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 p-2 flex flex-wrap gap-1 items-center">
        {/* Undo/Redo */}
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text formatting */}
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-moss-100 text-moss-700')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-moss-100 text-moss-700')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('strike') && 'bg-moss-100 text-moss-700')}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('code') && 'bg-moss-100 text-moss-700')}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 1 }) && 'bg-moss-100 text-moss-700')}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 2 }) && 'bg-moss-100 text-moss-700')}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 3 }) && 'bg-moss-100 text-moss-700')}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('bulletList') && 'bg-moss-100 text-moss-700')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('orderedList') && 'bg-moss-100 text-moss-700')}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('taskList') && 'bg-moss-100 text-moss-700')}
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Other */}
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('blockquote') && 'bg-moss-100 text-moss-700')}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('codeBlock') && 'bg-moss-100 text-moss-700')}
          >
            <FileCode className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertTable}
            className="h-8 w-8 p-0"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addLink}
            className={cn('h-8 w-8 p-0', editor.isActive('link') && 'bg-moss-100 text-moss-700')}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-moss-600 animate-pulse">
              Guardando...
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className={cn('h-8 px-3', showPreview && 'bg-moss-100 text-moss-700')}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            {showPreview ? 'Editor' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      {!showPreview ? (
        <EditorContent
          editor={editor}
          className="bg-white focus-within:ring-2 focus-within:ring-moss-200 focus-within:ring-inset transition-shadow"
        />
      ) : (
        <div
          className="prose prose-slate max-w-none p-6 bg-white"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
        />
      )}
    </div>
  )
}
