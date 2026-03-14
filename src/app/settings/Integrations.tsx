import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt, faDownload, faLanguage, faGlobe, faMicrochip, faCogs, faShieldAlt } from '@fortawesome/free-solid-svg-icons'
import { getItem, setItem } from '../../lib/safeStorage'
import { useTranslation } from 'react-i18next'
import Card from '../../components/Card'

const EXPORT_FORMATS = [
  { id: 'json', label: 'JSON' },
  { id: 'qasm', label: 'OpenQASM' },
  { id: 'cirq', label: 'Cirq (Python)' },
  { id: 'quil', label: 'Quil' },
] as const

const EXTERNAL_LINKS = [
  { name: 'IBM Quantum Experience', url: 'https://quantum.ibm.com/composer', description: 'Build and run circuits on IBM hardware' },
  { name: 'Qiskit', url: 'https://qiskit.org/documentation/', description: 'OpenQASM compatible' },
  { name: 'Amazon Braket', url: 'https://aws.amazon.com/braket/', description: 'Export QASM or Braket SDK' },
  { name: 'Cirq', url: 'https://quantumai.google/cirq', description: 'Export Cirq Python from Studio' },
]

const STORAGE_KEY = 'quantum:prefs:defaultExportFormat'

export default function Integrations() {
  const { t, i18n } = useTranslation()
  const [defaultFormat, setDefaultFormat] = useState<string>(() => getItem(STORAGE_KEY) || 'json')

  useEffect(() => {
    setItem(STORAGE_KEY, defaultFormat)
  }, [defaultFormat])

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('quantum:language', lang)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
              <FontAwesomeIcon icon={faLanguage} />
           </div>
           <div>
              <h3 className="text-sm font-bold text-theme-text">{t('settings.language_label')}</h3>
              <p className="text-[10px] text-theme-text-muted uppercase tracking-wider">{t('settings.language_desc')}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'en', label: 'English', flag: '🇺🇸' },
            { id: 'pt', label: 'Português', flag: '🇧🇷' }
          ].map(lang => (
            <button
              key={lang.id}
              onClick={() => toggleLanguage(lang.id)}
              className={`p-4 rounded-2xl transition-all duration-300 border flex items-center gap-4 ${
                i18n.language === lang.id
                  ? 'bg-accent/10 border-accent shadow-lg shadow-accent/10'
                  : 'bg-theme-surface border-theme-border/50 hover:border-accent/30 text-theme-text'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-sm font-bold">{lang.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <FontAwesomeIcon icon={faDownload} />
           </div>
           <div>
              <h3 className="text-sm font-bold text-theme-text">Export Defaults</h3>
              <p className="text-[10px] text-theme-text-muted uppercase tracking-wider">Studio preference</p>
           </div>
        </div>

        <select
          value={defaultFormat}
          onChange={(e) => setDefaultFormat(e.target.value)}
          className="w-full bg-theme-border/20 border border-theme-border/50 rounded-2xl py-3 px-4 text-sm font-bold text-theme-text outline-none focus:border-primary/50 transition-all text-center tracking-widest cursor-pointer"
        >
          {EXPORT_FORMATS.map((f) => (
            <option key={f.id} value={f.id} className="bg-bg text-theme-text">{f.label}</option>
          ))}
        </select>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-theme-text border border-white/10">
              <FontAwesomeIcon icon={faExternalLinkAlt} />
           </div>
           <div>
              <h3 className="text-sm font-bold text-theme-text">External Nodes</h3>
              <p className="text-[10px] text-theme-text-muted uppercase tracking-wider">Cloud hardware compatibility</p>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXTERNAL_LINKS.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-theme-surface/50 border border-theme-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                 <span className="text-xs font-bold text-theme-text group-hover:text-primary">{link.name}</span>
                 <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[9px] text-theme-text-muted leading-tight">{link.description}</p>
            </a>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-white/5 bg-white/5">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-xl bg-theme-border/20 flex items-center justify-center text-theme-text-muted">
              <FontAwesomeIcon icon={faShieldAlt} />
           </div>
           <div>
              <h3 className="text-sm font-bold text-white italic">Quantum Advanced</h3>
              <p className="text-[10px] text-theme-text-muted uppercase tracking-wider">{t('settings.advanced')}</p>
           </div>
        </div>
        
        <div className="space-y-2">
           {[
             { label: t('settings.hw_accel'), icon: faMicrochip, active: true },
             { label: t('settings.telemetry'), icon: faCogs, active: false }
           ].map((sub, i) => (
             <div key={i} className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                   <FontAwesomeIcon icon={sub.icon} className="text-[10px] text-theme-text-muted opacity-60" />
                   <span className="text-[10px] text-theme-text font-bold tracking-tight uppercase">{sub.label}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${sub.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500/50'}`} />
             </div>
           ))}
        </div>
      </Card>
    </div>
  )
}
