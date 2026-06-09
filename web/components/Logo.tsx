'use client'

import Image from 'next/image'
import { useTheme } from './ThemeProvider'

interface Props {
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function Logo({ width = 140, height = 40, className = 'h-8 w-auto', priority = false }: Props) {
  const { theme } = useTheme()
  const src = theme === 'light' ? '/logo-light.png' : '/logo-dark.png'

  return (
    <Image
      src={src}
      alt="Agroconecta"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  )
}
