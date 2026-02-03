import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faRocket, 
  faCalculator, 
  faAtom, 
  faBrain, 
  faCode, 
  faTerminal, 
  faCheckCircle, 
  faBug, 
  faInfoCircle 
} from '@fortawesome/free-solid-svg-icons'

const iconMap: Record<string, any> = {
  'Getting Started': faRocket,
  'Mathematical Foundations': faCalculator,
  'Quantum Concepts': faAtom,
  'Algorithms': faBrain,
  'QASM': faCode,
  'API': faTerminal,
  'Best Practices': faCheckCircle,
  'Troubleshooting': faBug,
  'Project Information': faInfoCircle
}

export default function SidebarDocs({ items, onSelect, selected }: { items: string[]; onSelect: (id: string)=>void; selected: string }) {
  return (
    <aside className="w-full lg:w-56 border-b lg:border-b-0 lg:border-r border-theme-border bg-theme-surface/30">
      <div className="p-4 border-b border-theme-border">
        <h3 className="text-sm font-semibold text-theme-text">Documentation</h3>
      </div>
      <ul className="text-sm py-2">
        {items.map(i => {
          const Icon = iconMap[i] || faInfoCircle
          const isSelected = selected === i
          return (
            <li key={i}>
              <button 
                className={`w-full text-left px-3 py-2.5 transition-colors flex items-center gap-2 ${
                  isSelected 
                    ? 'bg-primary text-white border-l-2 border-accent' 
                    : 'hover:bg-theme-surface hover:text-primary text-theme-text'
                }`} 
                onClick={()=> onSelect(i)}
              >
                <FontAwesomeIcon icon={Icon} className="text-xs w-4" />
                <span>{i}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}


