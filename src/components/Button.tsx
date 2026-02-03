import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const styles: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20',
  secondary: 'border border-theme-border hover:border-primary hover:bg-theme-surface/50 text-theme-text',
  ghost: 'hover:bg-theme-surface/50 text-theme-text',
}

export default function Button({ variant = 'primary', className = '', disabled, ...resto }: Props) {
  return (
    <button
      className={`px-3 py-2 rounded transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${styles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
      disabled={disabled}
      {...resto}
    />
  )
}


