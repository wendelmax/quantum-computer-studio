import React from 'react'
import ReactMarkdown from 'react-markdown'

function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="rounded-lg bg-bg-card border border-theme-border overflow-hidden">
      <div className="p-6 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-semibold mb-3 mt-4">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-semibold mb-2 mt-3">{children}</h3>,
            p: ({ children }) => <p className="text-sm text-theme-text leading-relaxed my-2">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
            li: ({ children }) => <li className="text-sm text-theme-text">{children}</li>,
            code: ({ children, className }) => {
              const isBlock = className?.includes('language-')
              return isBlock ? (
                <pre className="bg-theme-surface text-primary p-4 rounded-lg my-4 overflow-x-auto text-xs font-mono">
                  {children}
                </pre>
              ) : (
                <code className="px-1 py-0.5 bg-theme-surface rounded text-xs text-theme-text">{children}</code>
              )
            },
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-primary hover:text-accent underline"
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            ),
            strong: ({ children }) => <strong className="text-theme-text font-semibold">{children}</strong>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default MarkdownViewer
