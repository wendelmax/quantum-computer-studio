import React from 'react'
import ReactMarkdown from 'react-markdown'

function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="rounded-lg bg-bg-card border border-slate-800 overflow-hidden">
      <div className="p-6 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-semibold mb-3 mt-4">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-semibold mb-2 mt-3">{children}</h3>,
            p: ({ children }) => <p className="text-sm text-slate-300 leading-relaxed my-2">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
            li: ({ children }) => <li className="text-sm text-slate-300">{children}</li>,
            code: ({ children, className }) => {
              const isBlock = className?.includes('language-')
              return isBlock ? (
                <pre className="bg-slate-900 text-sky-300 p-4 rounded-lg my-4 overflow-x-auto text-xs font-mono">
                  {children}
                </pre>
              ) : (
                <code className="px-1 py-0.5 bg-slate-900 rounded text-xs">{children}</code>
              )
            },
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-sky-400 hover:text-sky-300 underline"
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            ),
            strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default MarkdownViewer
