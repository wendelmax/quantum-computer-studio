import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlask, faChartLine, faChartBar, faGlobe, faHashtag, faCog, faBook, faTerminal, faMinus, faExpand, faTimes, faHome, faCode, faTachometerAlt, faSlidersH, faBox, faBars, faCommentDots, faVial, faBrain, faMicrochip, faBolt, faPlay, faWaveSquare } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import Button from '../components/Button'
import { CircuitPrefsProvider } from './CircuitPrefs'
import { useQuantumStore } from '../store/quantumStore'
import { useTranslation } from 'react-i18next'

interface NavItem { path: string; key: string; icon: any; titleKey: string }

const NAV_GROUPS: { category: string; items: NavItem[] }[] = [
  {
    category: 'cat_build',
    items: [
      { path: '/circuits', key: 'studio', icon: faBolt, titleKey: 'studio.title' },
      { path: '/algorithms', key: 'algorithms', icon: faPlay, titleKey: 'algorithms.title' },
      { path: '/oracles', key: 'oracles', icon: faMicrochip, titleKey: 'oracles.title' },
    ]
  },
  {
    category: 'cat_labs',
    items: [
      { path: '/visual-lab', key: 'visual_lab', icon: faVial, titleKey: 'visual_lab.title' },
      { path: '/data-lab', key: 'data_lab', icon: faChartBar, titleKey: 'datalab.title' },
      { path: '/state-viewer', key: 'state_viewer', icon: faWaveSquare, titleKey: 'stateviewer.title' },
    ]
  },
  {
    category: 'cat_research',
    items: [
      { path: '/qml-hub', key: 'qml_hub', icon: faBrain, titleKey: 'qml.title' },
      { path: '/qnlp', key: 'qnlp', icon: faCommentDots, titleKey: 'qnlp.title' },
    ]
  },
  {
    category: 'cat_resources',
    items: [
      { path: '/gates', key: 'gates', icon: faHashtag, titleKey: 'gates_lib.title' },
      { path: '/docs', key: 'documentation', icon: faBook, titleKey: 'documentation.title' },
      { path: '/api', key: 'api_terminal', icon: faTerminal, titleKey: 'api.title' },
    ]
  },
  {
    category: 'cat_system',
    items: [
      { path: '/settings', key: 'settings', icon: faSlidersH, titleKey: 'settings.title' },
    ]
  }
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-theme-surface transition-all duration-200 ${isActive ? 'text-primary bg-theme-surface' : ''}`

const navLinkClassCollapsed = ({ isActive }: { isActive: boolean }) =>
  `text-left flex items-center justify-center px-2 py-2 rounded-lg hover:bg-theme-surface transition-all duration-200 ${isActive ? 'text-primary bg-theme-surface' : ''}`

export default function QuantumShell() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(isHome)
  const [focusMode, setFocusMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Sync sidebar state when navigating back to home if user hasn't manually changed it?
  // Actually, let's just use an effect to collapse it when entering home if we want strictly "auto"
  React.useEffect(() => {
    if (isHome) setSidebarCollapsed(true)
    else setSidebarCollapsed(false)
  }, [isHome])

  const clearCircuitStore = useQuantumStore(state => state.clearCircuit)
  const circuit = useQuantumStore(state => state.circuit)

  const clearCircuit = () => {
    clearCircuitStore()
    navigate('/')
  }

  const [status, setStatus] = useState<{ qubits: number; gates: number; states: number }>({ qubits: 0, gates: 0, states: 0 })

  React.useEffect(() => {
    if (circuit) {
      setStatus({
        qubits: circuit.numQubits || 0,
        gates: circuit.gates?.length || 0,
        states: Math.pow(2, circuit.numQubits || 0)
      })
    } else {
      setStatus({ qubits: 0, gates: 0, states: 0 })
    }
  }, [circuit])

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
                  <Link to="/" className="text-xl sm:text-2xl font-black tracking-tighter text-white hover:text-primary transition-colors flex items-center gap-2">
                    Quantum<span className="text-primary">Computer Studio</span>
                  </Link>
                  <div className="flex items-center gap-2 opacity-60">
                    <span className="text-[10px] font-bold tracking-widest text-primary/80">{t('shell.simulator_engine')}</span>
                    <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                  </div>
                </div>
              </div>

              {!isHome && (
                <div className="hidden md:flex items-center gap-6 px-4 py-2 rounded-full bg-black/20 border border-white/5 mx-4 flex-1 max-w-md justify-center animate-fade-in">
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
                  <h1 className="text-xl font-black text-theme-text tracking-tighter uppercase flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <FontAwesomeIcon icon={NAV_GROUPS.flatMap(g => g.items).find(i => i.path === location.pathname)?.icon || faFlask} className="text-xs text-primary" />
                    </div>
                    <span className="text-sm font-black text-theme-text uppercase tracking-tighter">
                      {t(NAV_GROUPS.flatMap(g => g.items).find(i => i.path === location.pathname)?.titleKey || 'studio.title')}
                    </span>
                  </h1>
                </div>
              )}

              {isHome && <div className="flex-1" />}

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
                <nav className="flex flex-col gap-6 p-4" aria-label="Main navigation">
                  {NAV_GROUPS.map((group) => (
                    <div key={group.category} className="space-y-1">
                      <div className="text-[9px] uppercase font-black text-theme-text-muted mb-2 tracking-widest px-3 opacity-50 flex items-center gap-2">
                        {t(`nav.${group.category}`)}
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      {group.items.map(({ path, key, icon }) => (
                        <NavLink key={path} to={path} className={navLinkClass}>
                          <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs text-primary shadow-inner">
                            <FontAwesomeIcon icon={icon} />
                          </span>
                          <span className="text-xs font-bold tracking-tight">{t(`nav.${key}`)}</span>
                        </NavLink>
                      ))}
                    </div>
                  ))}

                  <div className="mt-8 px-3 py-4 rounded-2xl bg-primary/10 border border-primary/20">
                    <div className="text-[10px] uppercase font-black text-primary mb-2 tracking-widest">{t('shell.active_circuit')}</div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-mono text-white leading-none">{status.qubits}q</div>
                      <div className="text-[10px] text-primary/70 font-bold uppercase">{status.gates} {t('shell.operators')}</div>
                    </div>
                  </div>
                </nav>
              </aside>
            )}

            {showCollapsed && (
              <aside className="hidden lg:block col-span-1 border-r border-white/5 bg-black/10 overflow-y-auto scrollbar-thin">
                <nav className="flex flex-col gap-4 p-4 items-center" aria-label="Main navigation">
                  {NAV_GROUPS.map((group) => (
                    <div key={group.category} className="flex flex-col gap-2 border-b border-white/5 pb-2 last:border-0">
                      {group.items.map(({ path, key, icon }) => (
                        <NavLink key={path} to={path} className={navLinkClassCollapsed} title={t(`nav.${key}`)}>
                          <FontAwesomeIcon icon={icon} className="text-base text-primary opacity-80" />
                        </NavLink>
                      ))}
                    </div>
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
                <nav className="flex flex-col gap-4 p-3" aria-label="Main navigation">
                  {NAV_GROUPS.map((group) => (
                    <div key={group.category} className="space-y-1">
                      <div className="text-[9px] uppercase font-black text-theme-text-muted mb-2 tracking-widest px-3 opacity-50">
                        {t(`nav.${group.category}`)}
                      </div>
                      {group.items.map(({ path, key, icon }) => (
                        <NavLink
                          key={path}
                          to={path}
                          className={navLinkClass}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="w-8 h-8 rounded-md bg-theme-surface flex items-center justify-center text-sm text-primary shrink-0">
                            <FontAwesomeIcon icon={icon} />
                          </span>
                          <span className="text-sm text-theme-text font-bold">{t(`nav.${key}`)}</span>
                        </NavLink>
                      ))}
                    </div>
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
