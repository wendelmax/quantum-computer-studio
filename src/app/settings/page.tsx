import React from 'react'
import ThemeSwitcher from './ThemeSwitcher'

export default function SettingsPage() {
  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <ThemeSwitcher />
      <div className="rounded-lg p-4 bg-bg-card border border-slate-800">Integrations (placeholder)</div>
    </div>
  )
}


