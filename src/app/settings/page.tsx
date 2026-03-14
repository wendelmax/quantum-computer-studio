import React from 'react'
import ThemeSwitcher from './ThemeSwitcher'
import Integrations from './Integrations'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSlidersH } from '@fortawesome/free-solid-svg-icons'

export default function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-theme-text tracking-tight flex items-center gap-3">
          <FontAwesomeIcon icon={faSlidersH} className="text-primary" />
          {t('settings.title')}
        </h2>
        <p className="text-sm text-theme-text-muted mt-1 font-medium italic">
          {t('settings.desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col gap-6">
          <ThemeSwitcher />
        </div>
        <div className="flex flex-col gap-6">
          <Integrations />
        </div>
      </div>
    </div>
  )
}
