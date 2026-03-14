import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
        <div className="mb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-theme-text">
            {currentSection.title[lang] || currentSection.title['en']}
          </h2>
          {activeSectionId === 'api' && (
            <div className="mt-2 p-3 bg-primary/10 border border-primary/50 rounded">
              <div className="text-sm text-theme-text">
                <strong className="text-primary">{t('api.title')}</strong>: {t('api.subtitle')} {' '}
                <a href="/api" className="underline hover:text-primary text-primary font-bold">/api</a>
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
