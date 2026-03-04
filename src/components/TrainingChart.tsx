import React from 'react'
import Card from './Card'

interface TrainingData {
    iteration: number
    cost: number
}

interface TrainingChartProps {
    data: TrainingData[]
    title?: string
}

export default function TrainingChart({ data, title = 'Cost Function Convergence' }: TrainingChartProps) {
    if (data.length === 0) return null

    const maxCost = Math.max(...data.map(d => Math.abs(d.cost)), 1)
    const minCost = Math.min(...data.map(d => d.cost))

    // Simple SVG chart
    const width = 400
    const height = 150
    const padding = 20

    const points = data.map((d, i) => {
        const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding)
        // Map cost to y: minCost -> height - padding, maxCost -> padding
        const y = height - padding - ((d.cost - minCost) / (maxCost - minCost || 1)) * (height - 2 * padding)
        return `${x},${y}`
    }).join(' ')

    return (
        <Card title={title}>
            <div className="w-full overflow-hidden">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    {/* Axes */}
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeWidth="1" className="text-theme-border" />
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" strokeWidth="1" className="text-theme-border" />

                    {/* Line */}
                    <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        points={points}
                        className="text-primary"
                        strokeLinejoin="round"
                    />

                    {/* Points */}
                    {data.map((d, i) => {
                        const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding)
                        const y = height - padding - ((d.cost - minCost) / (maxCost - minCost || 1)) * (height - 2 * padding)
                        return (
                            <circle key={i} cx={x} cy={y} r="3" fill="currentColor" className="text-accent" />
                        )
                    })}
                </svg>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] text-theme-text-muted">
                <span>Start</span>
                <span>Final Cost: {data[data.length - 1].cost.toFixed(4)}</span>
                <span>Iteration: {data[data.length - 1].iteration}</span>
            </div>
        </Card>
    )
}
