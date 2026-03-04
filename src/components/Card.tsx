import React from 'react'

type Props = {
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export default function Card({ title, description, children, className = '' }: Props) {
  return (
    <div className={`glass-card p-5 ${className}`.trim()}>
      {title && <div className="text-lg font-bold mb-1 text-theme-text">{title}</div>}
      {description && <div className="text-sm text-theme-text-muted mb-4">{description}</div>}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}


