import { Flame } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center rounded-lg bg-accent p-1.5">
        <Flame className={`${iconSizes[size]} text-accent-foreground`} />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-semibold text-foreground`}>
          Calorix AI
        </span>
      )}
    </div>
  )
}
