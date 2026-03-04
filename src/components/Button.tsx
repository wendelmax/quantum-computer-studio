import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const styles: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25 border border-primary/20',
  secondary: 'glass border border-theme-border hover:border-primary/50 text-theme-text shadow-sm',
  ghost: 'hover:bg-theme-surface/50 text-theme-text',
}

export default function Button({ variant = 'primary', className = '', disabled, ...resto }: Props) {
  return (
    <button
      className={`px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-300 active:scale-[0.96] hover:scale-[1.03] active:duration-100 ${styles[variant]} ${className} ${disabled ? 'opacity-40 cursor-not-allowed hover:scale-100 grayscale' : ''}`}
      disabled={disabled}
      {...resto}
    />
  )
}


