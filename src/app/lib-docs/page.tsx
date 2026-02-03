import React from 'react'
import MarkdownViewer from '../docs/components/MarkdownViewer'
import apiDoc from './api-doc-content.md?raw'

export default function LibDocsPage() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Library API Reference</h2>
        <p className="text-sm text-slate-400 mt-1">
          Types, simulator, and utilities for using quantum-computer-js in other systems.
        </p>
      </div>
      <MarkdownViewer content={apiDoc} />
    </div>
  )
}
