import { Text as RNText, type TextProps, StyleSheet } from 'react-native'
import { Fonts, FontSizes, LineHeights } from '@/constants/typography'
import { useColors } from '@/lib/theme-context'

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label'
type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold'
type Family = 'poppins' | 'dm-sans' | 'noto-sans'

interface Props extends TextProps {
  variant?: Variant
  weight?: Weight
  family?: Family
  color?: string
  /** Tamaño puntual en px, para las medidas específicas del rediseño que no entran en `variant`. */
  size?: number
  lineHeight?: number
  children: React.ReactNode
}

const variantStyles: Record<Variant, { fontSize: number; lineHeight: number }> = {
  display: { fontSize: FontSizes['3xl'], lineHeight: LineHeights['3xl'] },
  title: { fontSize: FontSizes['2xl'], lineHeight: LineHeights['2xl'] },
  subtitle: { fontSize: FontSizes.xl, lineHeight: LineHeights.xl },
  body: { fontSize: FontSizes.base, lineHeight: LineHeights.base },
  caption: { fontSize: FontSizes.sm, lineHeight: LineHeights.sm },
  label: { fontSize: FontSizes.xs, lineHeight: LineHeights.xs },
}

function getFontFamily(family: Family, weight: Weight): string {
  if (family === 'noto-sans') {
    return {
      regular: Fonts.notoSans,
      medium: Fonts.notoSansMedium,
      semibold: Fonts.notoSansSemiBold,
      bold: Fonts.notoSansBold,
      extrabold: Fonts.notoSansExtraBold,
    }[weight]
  }
  if (family === 'poppins') {
    return { regular: Fonts.poppins, medium: Fonts.poppinsMedium, semibold: Fonts.poppinsSemiBold, bold: Fonts.poppinsBold, extrabold: Fonts.poppinsBold }[weight]
  }
  return { regular: Fonts.dmSans, medium: Fonts.dmSansMedium, semibold: Fonts.dmSansSemiBold, bold: Fonts.dmSansBold, extrabold: Fonts.dmSansBold }[weight]
}

const defaultFamily: Record<Variant, Family> = {
  display: 'poppins',
  title: 'poppins',
  subtitle: 'poppins',
  body: 'dm-sans',
  caption: 'dm-sans',
  label: 'dm-sans',
}

const defaultWeight: Record<Variant, Weight> = {
  display: 'bold',
  title: 'semibold',
  subtitle: 'semibold',
  body: 'regular',
  caption: 'regular',
  label: 'medium',
}

export function Text({ variant = 'body', weight, family, color, size, lineHeight, style, children, ...props }: Props) {
  const C = useColors()
  const resolvedFamily = family ?? defaultFamily[variant]
  const resolvedWeight = weight ?? defaultWeight[variant]
  const fontFamily = getFontFamily(resolvedFamily, resolvedWeight)
  const variantSize = variantStyles[variant]

  return (
    <RNText
      style={[
        {
          fontFamily,
          fontSize: size ?? variantSize.fontSize,
          lineHeight: lineHeight ?? (size !== undefined ? undefined : variantSize.lineHeight),
          color: color ?? C.foreground,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  )
}
