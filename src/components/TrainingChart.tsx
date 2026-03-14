import React from 'react'
import Card from './Card'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartArea, faFlagCheckered } from '@fortawesome/free-solid-svg-icons'

interface TrainingData {
    iteration: number
    cost: number
}

interface TrainingChartProps {
    data: TrainingData[]
    title?: string
}

export default function TrainingChart({ data, title }: TrainingChartProps) {
    const { t } = useTranslation()
    if (data.length === 0) return null

    const maxCost = Math.max(...data.map(d => Math.abs(d.cost)), 1)
    const minCost = Math.min(...data.map(d => d.cost))

    const width = 400
    const height = 150
    const padding = 20

    const points = data.map((d, i) => {
        const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding)
        const y = height - padding - ((d.cost - minCost) / (maxCost - minCost || 1)) * (height - 2 * padding)
        return `${x},${y}`
    }).join(' ')

    const chartTitle = title || t('qml.stats_title')

    return (
        <Card className="p-5 border-accent/20">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-theme-text-muted flex items-center gap-2">
                <FontAwesomeIcon icon={faChartArea} className="text-accent" />
                {chartTitle}
            </h4>
            <div className="w-full overflow-hidden bg-theme-border/5 rounded-xl border border-theme-border/20 p-2">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-label={chartTitle} role="img">
                    <defs>
                        <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>
                    {/* Axes */}
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeWidth="1" className="text-theme-border opacity-30" />
                    
                    {/* Line */}
                    <polyline
                        fill="none"
                        stroke="url(#gradient-line)"
                        strokeWidth="3"
                        points={points}
                        strokeLinejoin="round"
                        className="drop-shadow-[0_2px_8px_rgba(var(--primary-rgb),0.4)]"
                    />

                    {/* Points */}
                    {data.map((d, i) => {
                        const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding)
                        const y = height - padding - ((d.cost - minCost) / (maxCost - minCost || 1)) * (height - 2 * padding)
                        return (
                            <circle key={i} cx={x} cy={y} r="2" fill="currentColor" className="text-accent" />
                        )
                    })}
                </svg>
            </div>
            <div className="flex justify-between items-center mt-4 text-[9px] font-bold uppercase tracking-tighter text-theme-text-muted">
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                   <span>Start</span>
                </div>
                <div className="flex items-center gap-4">
                   <span className="flex items-center gap-1">
                      <span className="opacity-50 italic">Cost:</span>
                      <span className="text-theme-text font-mono">{data[data.length - 1].cost.toFixed(4)}</span>
                   </span>
                   <span className="flex items-center gap-2 px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                      <FontAwesomeIcon icon={faFlagCheckered} className="text-[8px]" />
                      <span>Iter: {data[data.length - 1].iteration}</span>
                   </span>
                </div>
            </div>
        </Card>
    )
}
