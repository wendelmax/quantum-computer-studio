import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlask, faChartLine, faChartBar, faGlobe, faHashtag, faCog, faBook, faTerminal, faMinus, faExpand, faTimes, faHome, faImages, faCode, faTachometerAlt, faSlidersH, faBox, faBars } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { CircuitPrefsProvider } from './CircuitPrefs'
import { removeItem } from '../lib/safeStorage'
import { QUANTUM_CLEAR_CIRCUIT } from '../lib/events'

const NAV_ITEMS: { path: string; label: string; icon: typeof faFlask }[] = [
  { path: '/circuits', label: 'Quantum Studio', icon: faFlask },
  { path: '/algorithms', label: 'Algorithms', icon: faChartLine },
  { path: '/data-lab', label: 'Data Lab', icon: faChartBar },
  { path: '/state-viewer', label: 'State Viewer', icon: faGlobe },
  { path: '/gates', label: 'Gates Library', icon: faHashtag },
  { path: '/oracles', label: 'Oracles', icon: faCog },
  { path: '/gallery', label: 'Gallery', icon: faImages },
  { path: '/playground', label: 'Playground', icon: faCode },
  { path: '/execution', label: 'Execution', icon: faTachometerAlt },
  { path: '/docs', label: 'Documentation', icon: faBook },
  { path: '/api', label: 'API Terminal', icon: faTerminal },
  { path: '/lib-docs', label: 'Library API', icon: faBox },
  { path: '/settings', label: 'Settings', icon: faSlidersH },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-theme-surface transition-all duration-200 ${isActive ? 'text-primary bg-theme-surface' : ''}`

const navLinkClassCollapsed = ({ isActive }: { isActive: boolean }) =>
  `text-left flex items-center justify-center px-2 py-2 rounded-lg hover:bg-theme-surface transition-all duration-200 ${isActive ? 'text-primary bg-theme-surface' : ''}`

export default function QuantumShell() {
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

  const showSidebar = !focusMode && !sidebarCollapsed
  const showCollapsed = !focusMode && sidebarCollapsed
  const mainClass = focusMode ? 'col-span-12' : sidebarCollapsed ? 'col-span-12 lg:col-span-11' : 'col-span-12 lg:col-span-10'

  return (
    <CircuitPrefsProvider>
      <div className="min-h-screen bg-bg text-theme-text p-3 sm:p-4 lg:p-6 font-sans">
        <div className="relative max-w-[1200px] mx-auto rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl bg-bg-card">
          {!focusMode && (
            <header className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 lg:py-4 border-b border-theme-border bg-theme-surface/50 gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded hover:bg-theme-surface hover:text-primary transition-colors shrink-0"
                  title="Open menu"
                  aria-label="Open menu"
                >
                  <FontAwesomeIcon icon={faBars} />
                </button>
                <Link to="/" className="w-10 h-10 rounded-md bg-theme-surface flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faHome} className="text-primary" />
                </Link>
                <Link to="/" className="text-base sm:text-xl font-semibold tracking-wide text-theme-text hover:text-primary transition-colors truncate">Quantum Computer JS</Link>
                <span className="hidden sm:inline ml-2 px-2 py-0.5 text-xs bg-theme-surface rounded-md text-theme-text-muted shrink-0">demo</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-3 text-theme-text-muted shrink-0">
                <a
                  href="https://github.com/wendelmax/quantum-computer-js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded hover:bg-theme-surface transition-colors text-theme-text hover:text-primary"
                  title="View on GitHub"
                  aria-label="View on GitHub"
                >
                  <FontAwesomeIcon icon={faGithub} />
                </a>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:block p-2 rounded hover:bg-theme-surface hover:text-primary transition-colors"
                  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className="hidden sm:block p-2 rounded hover:bg-theme-surface hover:text-primary transition-colors"
                  title={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
                  aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
                >
                  <FontAwesomeIcon icon={faExpand} />
                </button>
                <button
                  onClick={clearCircuit}
                  className="p-2 rounded hover:bg-theme-surface hover:text-red-500 transition-colors text-theme-text"
                  title="Clear circuit and go to home"
                  aria-label="Clear circuit and go to home"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </header>
          )}

          {focusMode && (
            <div className="absolute top-2 right-2 z-50">
              <button
                onClick={() => setFocusMode(false)}
                className="p-2 rounded bg-theme-surface hover:bg-theme-border text-theme-text hover:text-primary transition-colors"
                title="Exit focus mode"
                aria-label="Exit focus mode"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-12 gap-4 lg:gap-6 p-4 lg:p-6">
            {showSidebar && (
              <aside className="hidden lg:block col-span-2 bg-transparent">
                <nav className="flex flex-col gap-2" aria-label="Main navigation">
                  {NAV_ITEMS.map(({ path, label, icon }) => (
                    <NavLink key={path} to={path} className={navLinkClass}>
                      <span className="w-8 h-8 rounded-md bg-theme-surface flex items-center justify-center text-sm text-primary">
                        <FontAwesomeIcon icon={icon} />
                      </span>
                      <span className="text-sm text-theme-text">{label}</span>
                    </NavLink>
                  ))}
                </nav>
              </aside>
            )}

            {showCollapsed && (
              <aside className="hidden lg:block col-span-1 bg-transparent">
                <nav className="flex flex-col gap-2" aria-label="Main navigation">
                  {NAV_ITEMS.map(({ path, label, icon }) => (
                    <NavLink key={path} to={path} className={navLinkClassCollapsed} title={label}>
                      <FontAwesomeIcon icon={icon} className="text-sm text-primary" />
                    </NavLink>
                  ))}
                </nav>
              </aside>
            )}

            <main className={mainClass}>
              <Outlet />
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
                  {NAV_ITEMS.map(({ path, label, icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={navLinkClass}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="w-8 h-8 rounded-md bg-theme-surface flex items-center justify-center text-sm text-primary shrink-0">
                        <FontAwesomeIcon icon={icon} />
                      </span>
                      <span className="text-sm text-theme-text">{label}</span>
                    </NavLink>
                  ))}
                </nav>
              </aside>
            </>
          )}
        </div>
      </div>
    </CircuitPrefsProvider>
  )
}
