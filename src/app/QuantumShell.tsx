import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlask, faChartLine, faChartBar, faGlobe, faHashtag, faCog, faBook, faTerminal, faMinus, faExpand, faTimes, faHome, faImages, faCode, faTachometerAlt, faSlidersH, faBox, faBars, faCommentDots } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import Button from '../components/Button'
import { CircuitPrefsProvider } from './CircuitPrefs'
import { removeItem } from '../lib/safeStorage'
import { QUANTUM_CLEAR_CIRCUIT, QUANTUM_SET_CIRCUIT } from '../lib/events'
import { useTranslation } from 'react-i18next'

const NAV_ITEMS: { path: string; key: string; icon: typeof faFlask }[] = [
  { path: '/circuits', key: 'studio', icon: faFlask },
  { path: '/algorithms', key: 'algorithms', icon: faChartLine },
  { path: '/data-lab', key: 'data_lab', icon: faChartBar },
  { path: '/state-viewer', key: 'state_viewer', icon: faGlobe },
  { path: '/gates', key: 'gates', icon: faHashtag },
  { path: '/oracles', key: 'oracles', icon: faCog },
  { path: '/qnlp', key: 'qnlp', icon: faCommentDots },
  { path: '/gallery', key: 'gallery', icon: faImages },
  { path: '/playground', key: 'playground', icon: faCode },
  { path: '/execution', key: 'execution', icon: faTachometerAlt },
  { path: '/docs', key: 'documentation', icon: faBook },
  { path: '/api', key: 'api_terminal', icon: faTerminal },
  { path: '/lib-docs', key: 'library_api', icon: faBox },
  { path: '/settings', key: 'settings', icon: faSlidersH },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-theme-surface transition-all duration-200 ${isActive ? 'text-primary bg-theme-surface' : ''}`

const navLinkClassCollapsed = ({ isActive }: { isActive: boolean }) =>
  `text-left flex items-center justify-center px-2 py-2 rounded-lg hover:bg-theme-surface transition-all duration-200 ${isActive ? 'text-primary bg-theme-surface' : ''}`

export default function QuantumShell() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const clearCircuit = () => {
    removeItem('quantum:circuit')
    removeItem('quantum:loadCircuit')
    window.dispatchEvent(new CustomEvent(QUANTUM_CLEAR_CIRCUIT))
    navigate('/')
  }

  const [status, setStatus] = useState<{ qubits: number; gates: number; states: number }>({ qubits: 0, gates: 0, states: 0 })

  React.useEffect(() => {
    const updateStatus = (e: any) => {
      const circuit = e.detail?.circuit
      if (circuit) {
        setStatus({
          qubits: circuit.numQubits || 0,
          gates: circuit.gates?.length || 0,
          states: Math.pow(2, circuit.numQubits || 0)
        })
      }
    }
    window.addEventListener(QUANTUM_SET_CIRCUIT, updateStatus)
    window.addEventListener(QUANTUM_CLEAR_CIRCUIT, () => setStatus({ qubits: 0, gates: 0, states: 0 }))

    // Initial load
    try {
      const saved = localStorage.getItem('quantum:circuit')
      if (saved) {
        const c = JSON.parse(saved)
        setStatus({ qubits: c.numQubits || 0, gates: c.gates?.length || 0, states: Math.pow(2, c.numQubits || 0) })
      }
    } catch { }

    return () => {
      window.removeEventListener(QUANTUM_SET_CIRCUIT, updateStatus)
    }
  }, [])

  const showSidebar = !focusMode && !sidebarCollapsed
  const showCollapsed = !focusMode && sidebarCollapsed
  const mainClass = focusMode ? 'col-span-12' : sidebarCollapsed ? 'col-span-12 lg:col-span-11' : 'col-span-12 lg:col-span-10'

  return (
    <CircuitPrefsProvider>
      <div className="min-h-screen bg-bg text-theme-text p-2 sm:p-4 lg:p-8 font-sans transition-all duration-700 mesh-gradient">
        <div className="relative max-w-[1400px] mx-auto rounded-2xl lg:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-bg-card/40 backdrop-blur-xl border border-white/5">
          {!focusMode && (
            <header className="flex items-center justify-between px-4 sm:px-6 py-4 lg:py-5 border-b border-white/5 bg-white/5 backdrop-blur-md gap-4">
              <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-white/10 hover:text-primary transition-all shrink-0"
                  title="Open menu"
                >
                  <FontAwesomeIcon icon={faBars} />
                </button>
                <Link to="/" className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-lg shadow-primary/10 group">
                  <FontAwesomeIcon icon={faHome} className="text-primary group-hover:scale-110 transition-transform" />
                </Link>
                <div className="flex flex-col">
                  <Link to="/" className="text-lg sm:text-2xl font-bold tracking-tight text-white hover:text-primary transition-colors truncate">Quantum Studio</Link>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-theme-text-muted font-bold">{t('shell.simulator_engine')}</span>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-6 px-4 py-2 rounded-full bg-black/20 border border-white/5 mx-4 flex-1 max-w-md justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase text-theme-text-muted font-bold">{t('shell.qubits')}</span>
                  <span className="text-sm font-mono text-primary">{status.qubits}</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase text-theme-text-muted font-bold">{t('shell.gates')}</span>
                  <span className="text-sm font-mono text-green-400">{status.gates}</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase text-theme-text-muted font-bold">{t('shell.states')}</span>
                  <span className="text-sm font-mono text-purple-400">{status.states.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-3 text-theme-text-muted shrink-0">
                <a
                  href="https://github.com/wendelmax/quantum-computer-js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg hover:bg-white/10 transition-all text-theme-text hover:text-primary"
                  title="View on GitHub"
                >
                  <FontAwesomeIcon icon={faGithub} />
                </a>
                <div className="flex items-center bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                  <button
                    onClick={() => i18n.changeLanguage('pt')}
                    className={`px-2 py-1 text-[10px] font-bold transition-all ${i18n.language === 'pt' ? 'bg-primary text-black' : 'hover:bg-white/10 text-theme-text-muted'}`}
                  >
                    PT
                  </button>
                  <button
                    onClick={() => i18n.changeLanguage('en')}
                    className={`px-2 py-1 text-[10px] font-bold transition-all ${i18n.language === 'en' ? 'bg-primary text-black' : 'hover:bg-white/10 text-theme-text-muted'}`}
                  >
                    EN
                  </button>
                </div>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:block p-2.5 rounded-lg hover:bg-white/10 hover:text-primary transition-all"
                  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className="hidden sm:block p-2.5 rounded-lg hover:bg-white/10 hover:text-primary transition-all"
                  title={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
                >
                  <FontAwesomeIcon icon={faExpand} />
                </button>
                <button
                  onClick={clearCircuit}
                  className="p-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all text-theme-text"
                  title="Clear circuit"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </header>
          )}

          {focusMode && (
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setFocusMode(false)}
                className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-theme-text hover:text-primary transition-all shadow-xl hover:scale-110 active:scale-95"
                title="Exit focus mode"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-12 min-h-[calc(100vh-160px)]">
            {showSidebar && (
              <aside className="hidden lg:block col-span-2 border-r border-white/5 bg-black/10 overflow-y-auto scrollbar-thin">
                <nav className="flex flex-col gap-1 p-4" aria-label="Main navigation">
                  <div className="text-[10px] uppercase font-black text-theme-text-muted mb-4 tracking-widest px-3">{t('common.applications')}</div>
                  {NAV_ITEMS.map(({ path, key, icon }) => (
                    <NavLink key={path} to={path} className={navLinkClass}>
                      <span className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-sm text-primary shadow-inner">
                        <FontAwesomeIcon icon={icon} />
                      </span>
                      <span className="text-sm font-medium">{t(`nav.${key}`)}</span>
                    </NavLink>
                  ))}

                  <div className="mt-8 px-3 py-4 rounded-2xl bg-primary/10 border border-primary/20">
                    <div className="text-[10px] uppercase font-black text-primary mb-2 tracking-widest">Active Circuit</div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-mono text-white leading-none">{status.qubits}q</div>
                      <div className="text-[10px] text-primary/70 font-bold uppercase">{status.gates} operators</div>
                    </div>
                  </div>
                </nav>
              </aside>
            )}

            {showCollapsed && (
              <aside className="hidden lg:block col-span-1 border-r border-white/5 bg-black/10 overflow-y-auto scrollbar-thin">
                <nav className="flex flex-col gap-3 p-4 items-center" aria-label="Main navigation">
                  {NAV_ITEMS.map(({ path, key, icon }) => (
                    <NavLink key={path} to={path} className={navLinkClassCollapsed} title={t(`nav.${key}`)}>
                      <FontAwesomeIcon icon={icon} className="text-lg text-primary" />
                    </NavLink>
                  ))}
                </nav>
              </aside>
            )}

            <main className={`${mainClass} overflow-y-auto scrollbar-thin bg-black/5`}>
              <div className="animate-fade-in p-2 lg:p-0">
                <Outlet />
              </div>
            </main>
          </div>

          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />
              <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-bg-card border-r border-theme-border z-50 lg:hidden flex flex-col pt-16 pb-4 overflow-y-auto">
                <nav className="flex flex-col gap-1 p-3" aria-label="Main navigation">
                  {NAV_ITEMS.map(({ path, key, icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={navLinkClass}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="w-8 h-8 rounded-md bg-theme-surface flex items-center justify-center text-sm text-primary shrink-0">
                        <FontAwesomeIcon icon={icon} />
                      </span>
                      <span className="text-sm text-theme-text">{t(`nav.${key}`)}</span>
                    </NavLink>
                  ))}
                </nav>
              </aside>
            </>
          )}
        </div>
      </div>
    </CircuitPrefsProvider >
  )
}
