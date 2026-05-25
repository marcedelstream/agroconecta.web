import { CATEGORY_LABELS, CATEGORY_COLORS, type NewsCategory } from '@/lib/types'

interface Props {
  category: NewsCategory
  size?: 'sm' | 'md'
  active?: boolean
}

export function CategoryBadge({ category, size = 'sm', active = false }: Props) {
  const color = CATEGORY_COLORS[category] ?? '#6B7280'
  const label = CATEGORY_LABELS[category] ?? category

  return (
    <span
      className={`badge font-medium ${size === 'md' ? 'text-sm px-3 py-1' : ''}`}
      style={{
        backgroundColor: active ? color : `${color}20`,
        color: active ? '#0A0A13' : color,
      }}
    >
      {label}
    </span>
  )
}
