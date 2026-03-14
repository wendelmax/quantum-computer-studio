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
  'getting-started': faRocket,
  'math': faCalculator,
  'concepts': faAtom,
  'algorithms': faBrain,
  'qasm': faCode,
  'api': faTerminal,
  'best-practices': faCheckCircle,
  'troubleshooting': faBug,
  'project-info': faInfoCircle
}

type SidebarItem = {
  id: string
  label: string
}

export default function SidebarDocs({ 
  items, 
  onSelect, 
  selected 
}: { 
  items: SidebarItem[]; 
  onSelect: (id: string)=>void; 
  selected: string 
}) {
  return (
    <aside className="w-full border-b lg:border-b-0 lg:border-r border-theme-border bg-theme-surface/30 h-full rounded-xl overflow-hidden">
      <div className="p-4 border-b border-theme-border bg-theme-surface/50">
        <h3 className="text-sm font-semibold text-theme-text">Documentation</h3>
      </div>
      <ul className="text-sm py-2 overflow-y-auto">
        {items.map(i => {
          const Icon = iconMap[i.id] || faInfoCircle
          const isSelected = selected === i.id
          return (
            <li key={i.id}>
              <button 
                className={`w-full text-left px-4 py-3 transition-all flex items-center gap-3 ${
                  isSelected 
                    ? 'bg-primary text-white font-bold' 
                    : 'hover:bg-theme-surface hover:text-primary text-theme-text-muted hover:text-theme-text'
                }`} 
                onClick={()=> onSelect(i.id)}
              >
                <FontAwesomeIcon icon={Icon} className={`text-xs w-4 ${isSelected ? 'text-white' : 'text-primary'}`} />
                <span>{i.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
