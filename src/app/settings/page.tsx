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
      <div>
        <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
               <FontAwesomeIcon icon={faSlidersH} className="text-xl text-primary" />
            </div>
            <h2 className="text-3xl font-black text-theme-text tracking-tight uppercase">{t('settings.title')}</h2>
        </div>
        <p className="text-sm font-medium text-theme-text-muted opacity-60 ml-1">
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
