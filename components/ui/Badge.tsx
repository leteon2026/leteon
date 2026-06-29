import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'lime' | 'red' | 'zinc'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-700 text-zinc-300',
    lime: 'bg-lime-400/10 text-lime-400 border border-lime-400/30',
    red: 'bg-red-500/10 text-red-400 border border-red-500/30',
    zinc: 'bg-zinc-800 text-zinc-400',
  }

  return (
    <span className={cn('inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full', variants[variant], className)}>
      {children}
    </span>
  )
}
