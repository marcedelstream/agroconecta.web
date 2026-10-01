import Image from 'next/image'

interface Props {
  width?: number
  height?: number
  className?: string
  priority?: boolean
  /** "onDark" para fondos oscuros ("conecta" en blanco). */
  variant?: 'onLight' | 'onDark'
}

export function Logo({ width = 140, height = 40, className = 'h-8 w-auto', priority = false, variant = 'onLight' }: Props) {
  const src = variant === 'onLight' ? '/logo-light.png' : '/logo-dark.png'

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
