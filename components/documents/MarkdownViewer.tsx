'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  // Si el contenido es HTML (de TipTap), renderizarlo directamente
  if (content.startsWith('<')) {
    return (
      <div
        className={cn('prose prose-slate max-w-none', className)}
        dangerouslySetInnerHTML={{ __html: content || '<p><em>Sin contenido</em></p>' }}
      />
    )
  }

  // Si es Markdown puro, usar react-markdown
  return (
    <div className={cn('prose prose-slate max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-moss-600 hover:text-moss-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match && !className

            if (isInline) {
              return (
                <code
                  className="bg-moss-100 text-moss-800 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            }

            return (
              <code
                className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm"
                {...props}
              >
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-4 py-2">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-moss-400 pl-4 italic text-gray-700 my-4">
              {children}
            </blockquote>
          ),
          ul: ({ children, className }) => {
            // Check if it's a task list
            const isTaskList = className?.includes('contains-task-list')
            return (
              <ul className={cn('pl-6 my-4', isTaskList && 'list-none pl-2')}>
                {children}
              </ul>
            )
          },
          li: ({ children, className }) => {
            const isTaskItem = className?.includes('task-list-item')
            return (
              <li className={cn(isTaskItem && 'flex items-start gap-2 my-1')}>
                {children}
              </li>
            )
          },
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mt-1 cursor-default"
                  {...props}
                />
              )
            }
            return <input type={type} {...props} />
          },
          h1: ({ children }) => (
            <h1 className="text-4xl font-display font-bold mt-8 mb-4 text-gray-900">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-display font-semibold mt-6 mb-3 text-gray-800">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-display font-semibold mt-4 mb-2 text-gray-800">
              {children}
            </h3>
          ),
        }}
      >
        {content || '*Sin contenido*'}
      </ReactMarkdown>
    </div>
  )
}
