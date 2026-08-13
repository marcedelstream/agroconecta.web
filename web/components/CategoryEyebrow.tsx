import { CATEGORY_LABELS, CATEGORY_COLORS, type NewsCategory } from '@/lib/types'

interface Props {
  category: NewsCategory
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-[11px] tracking-[0.14em]',
  md: 'text-xs tracking-[0.16em]',
  lg: 'text-sm tracking-[0.18em]',
}

export function CategoryEyebrow({ category, size = 'sm', className = '' }: Props) {
  const color = CATEGORY_COLORS[category] ?? '#6B7280'
  const label = CATEGORY_LABELS[category] ?? category

  return (
    <span className={`font-display font-semibold uppercase ${SIZE_CLASSES[size]} ${className}`} style={{ color }}>
      {label}
    </span>
  )
}
