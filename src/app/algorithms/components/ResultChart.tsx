import React from 'react'
import Card from '../../../components/Card'
import { useTranslation } from 'react-i18next'

export default function ResultChart({ data }: { data?: Record<string, number> }) {
  const { t } = useTranslation()
  const entries = data ? Object.entries(data).sort((a,b)=> b[1]-a[1]).slice(0,16) : []
  return (
    <Card className="p-5">
      <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 text-theme-text-muted flex items-center justify-between">
         <span>{t('studio.results')}</span>
         {entries.length > 0 && <span className="text-primary opacity-60">Peak Prob: {(Math.max(...Object.values(data!)) * 100).toFixed(0)}%</span>}
      </h4>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 min-h-[140px] items-end">
        {entries.length ? entries.map(([state,p]) => (
          <div key={state} className="group flex flex-col items-center gap-2">
            <div className="relative w-full h-24 bg-theme-border/10 rounded-lg border border-theme-border/20 flex flex-col justify-end overflow-hidden">
              <div 
                className="w-full bg-gradient-to-t from-primary to-accent transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" 
                style={{height: `${Math.min(100, p*100)}%`}} 
              />
              {p > 0.05 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[8px] font-bold text-white drop-shadow-md">{(p*100).toFixed(0)}%</span>
                </div>
              )}
            </div>
            <div className="text-[9px] font-mono font-bold text-theme-text-muted tracking-tighter group-hover:text-primary transition-colors">
               |{state}⟩
            </div>
          </div>
        )) : (
          <div className="col-span-full h-24 flex items-center justify-center border-2 border-dashed border-theme-border/30 rounded-2xl">
             <span className="text-xs font-medium text-theme-text-muted opacity-40 italic">{t('algorithms.library_desc')}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
