import React, { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlask, faChartLine, faChartBar, faGlobe, faHashtag, faCog, faBook, faTerminal, faMinus, faExpand, faTimes, faHome } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { CircuitPrefsProvider } from './CircuitPrefs'

export default function QuantumShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleFocusMode = () => {
    setFocusMode(!focusMode)
  }

  const clearCircuit = () => {
    localStorage.removeItem('quantum:circuit')
    localStorage.removeItem('quantum:loadCircuit')
    window.dispatchEvent(new CustomEvent('quantum:clear-circuit'))
    navigate('/')
  }

  return (
    <CircuitPrefsProvider>
      <div className="min-h-screen bg-bg text-slate-100 p-6 font-sans">
        <div className="max-w-[1200px] mx-auto rounded-2xl overflow-hidden shadow-2xl bg-bg-card">
          {!focusMode && (
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-bg/40">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-slate-900/40 flex items-center justify-center">
                  <FontAwesomeIcon icon={faHome} className="text-sky-300" />
                </div>
                <Link to="/" className="text-xl font-semibold tracking-wide hover:text-sky-300 transition-colors">Quantum Computer JS</Link>
                <span className="ml-3 px-2 py-0.5 text-xs bg-slate-800 rounded-md text-slate-300">demo</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <a
                  href="https://github.com/wendelmax/quantum-computer-js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded hover:bg-slate-800/40 transition-colors text-slate-300 hover:text-sky-300"
                  title="View on GitHub"
                >
                  <FontAwesomeIcon icon={faGithub} />
                </a>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded hover:bg-slate-800/40 hover:text-sky-300 transition-colors"
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <button
                  onClick={toggleFocusMode}
                  className="p-2 rounded hover:bg-slate-800/40 hover:text-sky-300 transition-colors"
                  title={focusMode ? "Exit focus mode" : "Enter focus mode"}
                >
                  <FontAwesomeIcon icon={faExpand} />
                </button>
                <button
                  onClick={clearCircuit}
                  className="p-2 rounded hover:bg-slate-800/40 hover:text-red-400 transition-colors"
                  title="Clear circuit and go to home"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </header>
          )}

          {focusMode && (
            <div className="absolute top-2 right-2 z-50">
              <button
                onClick={toggleFocusMode}
                className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-sky-300 transition-colors"
                title="Exit focus mode"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}

          <div className={`grid gap-6 p-6 ${focusMode ? 'grid-cols-1' : sidebarCollapsed ? 'grid-cols-12' : 'grid-cols-12'}`}>
            {!focusMode && !sidebarCollapsed && (
              <aside className="col-span-2 bg-transparent">
              <nav className="flex flex-col gap-2">
                <NavLink to="/circuits" className={({ isActive }) => `text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`}>
                  <span className="w-8 h-8 rounded-md bg-slate-900/40 flex items-center justify-center text-sm text-sky-300"><FontAwesomeIcon icon={faFlask} /></span>
                  <span className="text-sm">Quantum Studio</span>
                </NavLink>
                <NavLink to="/algorithms" className={({ isActive }) => `text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`}>
                  <span className="w-8 h-8 rounded-md bg-slate-900/40 flex items-center justify-center text-sm text-sky-300"><FontAwesomeIcon icon={faChartLine} /></span>
                  <span className="text-sm">Algorithms</span>
                </NavLink>
                <NavLink to="/data-lab" className={({ isActive }) => `text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`}>
                  <span className="w-8 h-8 rounded-md bg-slate-900/40 flex items-center justify-center text-sm text-sky-300"><FontAwesomeIcon icon={faChartBar} /></span>
                  <span className="text-sm">Data Explorer</span>
                </NavLink>
                <NavLink to="/state-viewer" className={({ isActive }) => `text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`}>
                  <span className="w-8 h-8 rounded-md bg-slate-900/40 flex items-center justify-center text-sm text-sky-300"><FontAwesomeIcon icon={faGlobe} /></span>
                  <span className="text-sm">State Viewer</span>
                </NavLink>
                <NavLink to="/gates" className={({ isActive }) => `text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`}>
                  <span className="w-8 h-8 rounded-md bg-slate-900/40 flex items-center justify-center text-sm text-sky-300"><FontAwesomeIcon icon={faHashtag} /></span>
                  <span className="text-sm">Gates Library</span>
                </NavLink>
                <NavLink to="/oracles" className={({ isActive }) => `text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`}>
                  <span className="w-8 h-8 rounded-md bg-slate-900/40 flex items-center justify-center text-sm text-sky-300"><FontAwesomeIcon icon={faCog} /></span>
                  <span className="text-sm">Oracles</span>
                </NavLink>
                <NavLink to="/docs" className={({ isActive }) => `text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`}>
                  <span className="w-8 h-8 rounded-md bg-slate-900/40 flex items-center justify-center text-sm text-sky-300"><FontAwesomeIcon icon={faBook} /></span>
                  <span className="text-sm">Documentation</span>
                </NavLink>
                <NavLink to="/api" className={({ isActive }) => `text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`}>
                  <span className="w-8 h-8 rounded-md bg-slate-900/40 flex items-center justify-center text-sm text-sky-300"><FontAwesomeIcon icon={faTerminal} /></span>
                  <span className="text-sm">API Terminal</span>
                </NavLink>
              </nav>
              </aside>
            )}

            {!focusMode && sidebarCollapsed && (
              <aside className="col-span-1 bg-transparent">
                <nav className="flex flex-col gap-2">
                  <NavLink to="/circuits" className={({ isActive }) => `text-left flex items-center justify-center px-2 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`} title="Quantum Studio">
                    <FontAwesomeIcon icon={faFlask} className="text-sm text-sky-300" />
                  </NavLink>
                  <NavLink to="/algorithms" className={({ isActive }) => `text-left flex items-center justify-center px-2 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`} title="Algorithms">
                    <FontAwesomeIcon icon={faChartLine} className="text-sm text-sky-300" />
                  </NavLink>
                  <NavLink to="/data-lab" className={({ isActive }) => `text-left flex items-center justify-center px-2 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`} title="Data Explorer">
                    <FontAwesomeIcon icon={faChartBar} className="text-sm text-sky-300" />
                  </NavLink>
                  <NavLink to="/state-viewer" className={({ isActive }) => `text-left flex items-center justify-center px-2 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`} title="State Viewer">
                    <FontAwesomeIcon icon={faGlobe} className="text-sm text-sky-300" />
                  </NavLink>
                  <NavLink to="/gates" className={({ isActive }) => `text-left flex items-center justify-center px-2 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`} title="Gates Library">
                    <FontAwesomeIcon icon={faHashtag} className="text-sm text-sky-300" />
                  </NavLink>
                  <NavLink to="/oracles" className={({ isActive }) => `text-left flex items-center justify-center px-2 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`} title="Oracles">
                    <FontAwesomeIcon icon={faCog} className="text-sm text-sky-300" />
                  </NavLink>
                  <NavLink to="/docs" className={({ isActive }) => `text-left flex items-center justify-center px-2 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`} title="Documentation">
                    <FontAwesomeIcon icon={faBook} className="text-sm text-sky-300" />
                  </NavLink>
                  <NavLink to="/api" className={({ isActive }) => `text-left flex items-center justify-center px-2 py-2 rounded-lg hover:bg-slate-800/30 transition-all ${isActive ? 'text-primary' : ''}`} title="API Terminal">
                    <FontAwesomeIcon icon={faTerminal} className="text-sm text-sky-300" />
                  </NavLink>
                </nav>
              </aside>
            )}

            <main className={focusMode ? 'col-span-1' : sidebarCollapsed ? 'col-span-11' : 'col-span-10'}>
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </CircuitPrefsProvider>
  )
}

