import React from 'react'

type Props = {
  title?: string
  description?: string
  children?: React.ReactNode
}

export default function Card({ title, description, children }: Props) {
  return (
    <div className="rounded-lg bg-bg-card border border-slate-800 p-4">
      {title && <div className="text-lg font-semibold mb-1">{title}</div>}
      {description && <div className="text-sm text-slate-300 mb-2">{description}</div>}
      {children}
    </div>
  )
}


