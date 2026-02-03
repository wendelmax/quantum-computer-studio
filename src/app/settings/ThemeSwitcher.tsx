import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun, faCircleNodes, faWater } from '@fortawesome/free-solid-svg-icons'

const themes = [
  { id: 'dark', name: 'Dark', description: 'Default dark theme', icon: faMoon },
  { id: 'light', name: 'Light', description: 'Light theme', icon: faSun },
  { id: 'matrix', name: 'Matrix', description: 'Green matrix style', icon: faCircleNodes },
  { id: 'ocean', name: 'Ocean', description: 'Ocean blue', icon: faWater }
]

export default function ThemeSwitcher() {
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
    <div className="rounded-lg p-4 bg-bg-card border border-theme-border">
      <div className="text-sm font-medium mb-3 text-theme-text">Theme Settings</div>
      <div className="space-y-2">
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => setCurrentTheme(theme.id)}
            className={`w-full text-left p-3 rounded transition-all flex items-center gap-3 ${
              currentTheme === theme.id
                ? 'bg-primary/20 border border-primary text-primary'
                : 'bg-theme-surface border border-theme-border hover:border-primary/50 text-theme-text'
            }`}
          >
            <FontAwesomeIcon icon={theme.icon} className="text-lg shrink-0 text-theme-text opacity-90" />
            <div>
              <div className="font-medium">{theme.name}</div>
              <div className="text-xs text-theme-text-muted">{theme.description}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 text-xs text-theme-text-muted">
        Current theme: <span className="text-primary">{currentTheme}</span>
      </div>
    </div>
  )
}
