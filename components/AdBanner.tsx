interface Props {
  variant?: 'leaderboard' | 'rectangle'
  label?: string
}

export function AdBanner({ variant = 'leaderboard', label = 'Publicidad' }: Props) {
  if (variant === 'rectangle') {
    return (
      <div className="w-full rounded-xl border border-bdr border-dashed bg-secondary/40
                      flex flex-col items-center justify-center gap-2 py-8">
        <span className="text-[10px] uppercase tracking-widest text-muted/60 font-medium">
          {label}
        </span>
        <div className="w-[300px] h-[250px] flex items-center justify-center">
          <span className="text-muted/40 text-xs">300 × 250</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl border border-bdr border-dashed bg-secondary/40
                    flex flex-col items-center justify-center gap-1.5 py-4 min-h-[90px]">
      <span className="text-[10px] uppercase tracking-widest text-muted/60 font-medium">
        {label}
      </span>
      <span className="text-muted/40 text-xs">728 × 90</span>
    </div>
  )
}
