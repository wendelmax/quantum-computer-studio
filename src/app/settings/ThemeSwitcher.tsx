import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun, faCircleNodes, faWater, faPalette, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import Card from '../../components/Card'

const themes = [
  { id: 'dark', icon: faMoon, color: 'text-primary' },
  { id: 'light', icon: faSun, color: 'text-yellow-500' },
  { id: 'matrix', icon: faCircleNodes, color: 'text-green-500' },
  { id: 'ocean', icon: faWater, color: 'text-blue-500' }
]

export default function ThemeSwitcher() {
  const { t } = useTranslation()
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('quantum:theme') || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', currentTheme)
      localStorage.setItem('quantum:theme', currentTheme)
    }
  }, [currentTheme])

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <FontAwesomeIcon icon={faPalette} />
         </div>
         <div>
            <h3 className="text-sm font-bold text-theme-text">{t('settings.theme_label')}</h3>
            <p className="text-[10px] text-theme-text-muted uppercase tracking-wider">{t('settings.theme_desc')}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => setCurrentTheme(theme.id)}
            className={`group text-left p-4 rounded-2xl transition-all duration-300 border flex items-center justify-between ${
              currentTheme === theme.id
                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                : 'bg-theme-surface border-theme-border/50 hover:border-primary/30 text-theme-text'
            }`}
          >
            <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-xl bg-theme-border/20 flex items-center justify-center transition-transform group-hover:scale-110 ${theme.color}`}>
                  <FontAwesomeIcon icon={theme.icon} className="text-lg" />
               </div>
               <div>
                  <div className="text-sm font-bold text-theme-text">
                     {theme.id === 'dark' ? t('settings.dark_theme') : 
                      theme.id === 'light' ? t('settings.light_theme') :
                      theme.id === 'matrix' ? t('settings.cyber_theme') : 'Ocean Deep'}
                  </div>
                  <div className="text-[10px] text-theme-text-muted font-medium">Standard UI</div>
               </div>
            </div>
            {currentTheme === theme.id && (
               <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                  <FontAwesomeIcon icon={faCheck} />
               </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-theme-border/50 flex items-center justify-between text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">
         <span>Selection Active</span>
         <span className="text-primary">{currentTheme} mode</span>
      </div>
    </Card>
  )
}
