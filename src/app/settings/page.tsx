import React from 'react'
import ThemeSwitcher from './ThemeSwitcher'
import Integrations from './Integrations'

export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-theme-surface/30 min-h-[60vh] rounded-lg">
      <ThemeSwitcher />
      <Integrations />
    </div>
  )
}


