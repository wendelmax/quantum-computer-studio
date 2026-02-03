import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const styles: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-sky-600 text-black hover:bg-sky-500 hover:shadow-lg hover:shadow-sky-500/20',
  secondary: 'border border-slate-700 hover:border-sky-600 hover:bg-slate-800/50',
  ghost: 'hover:bg-slate-800/40',
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


