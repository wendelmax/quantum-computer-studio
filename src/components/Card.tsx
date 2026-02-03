import React from 'react'

type Props = {
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export default function Card({ title, description, children, className = '' }: Props) {
  return (
    <div className={`rounded-lg bg-bg-card border border-theme-border p-4 transition-smooth hover:border-primary/50 hover:shadow-lg hover:shadow-black/10 ${className}`.trim()}>
      {title && <div className="text-lg font-semibold mb-1 text-theme-text">{title}</div>}
      {description && <div className="text-sm text-theme-text-muted mb-2">{description}</div>}
      {children}
    </div>
  )
}


