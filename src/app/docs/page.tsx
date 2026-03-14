import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { faBook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SidebarDocs from './components/SidebarDocs'
import MarkdownViewer from './components/MarkdownViewer'
import { DOCS_CONTENT } from './docsContent'

export default function DocsPage() {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language || 'en').split('-')[0] as 'en' | 'pt'
  const [activeSectionId, setActiveSectionId] = useState(DOCS_CONTENT[0].id)
  
  const currentSection = DOCS_CONTENT.find(s => s.id === activeSectionId) || DOCS_CONTENT[0]
  const content = currentSection.content[lang] || currentSection.content['en']

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-120px)] overflow-hidden">
      <div className="lg:col-span-3 h-full overflow-y-auto">
        <SidebarDocs 
          items={DOCS_CONTENT.map(s => ({ id: s.id, label: s.title[lang] || s.title['en'] }))} 
          onSelect={setActiveSectionId} 
          selected={activeSectionId} 
        />
      </div>
      <div className="lg:col-span-9 h-full flex flex-col overflow-hidden">
        <div className="mb-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
               <FontAwesomeIcon icon={faBook} className="text-xl text-primary" />
            </div>
            <h2 className="text-3xl font-black text-theme-text tracking-tight uppercase">
              {currentSection.title[lang] || currentSection.title['en']}
            </h2>
          </div>
          <p className="text-sm font-medium text-theme-text-muted opacity-60 ml-1">
            Documentation module for quantum concepts and API references.
          </p>

          {activeSectionId === 'api' && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl animate-in fade-in slide-in-from-left-4">
              <div className="text-xs font-black uppercase tracking-widest text-theme-text flex items-center gap-3">
                <span className="text-primary">ENDPOINT</span>
                <span className="text-theme-text-muted opacity-50">API Reference:</span>
                <a href="/api" className="text-primary hover:underline">/api</a>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto bg-theme-surface/10 rounded-xl border border-theme-border">
          <MarkdownViewer key={activeSectionId} content={content} />
        </div>
      </div>
    </div>
  )
}
