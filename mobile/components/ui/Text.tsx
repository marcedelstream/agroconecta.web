import { Text as RNText, type TextProps, StyleSheet } from 'react-native'
import { Fonts, FontSizes, LineHeights } from '@/constants/typography'
import { useColors } from '@/lib/theme-context'

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label'
type Weight = 'regular' | 'medium' | 'semibold' | 'bold'
type Family = 'poppins' | 'dm-sans'

interface Props extends TextProps {
  variant?: Variant
  weight?: Weight
  family?: Family
  color?: string
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
  if (family === 'poppins') {
    return { regular: Fonts.poppins, medium: Fonts.poppinsMedium, semibold: Fonts.poppinsSemiBold, bold: Fonts.poppinsBold }[weight]
  }
  return { regular: Fonts.dmSans, medium: Fonts.dmSansMedium, semibold: Fonts.dmSansSemiBold, bold: Fonts.dmSansBold }[weight]
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

export function Text({ variant = 'body', weight, family, color, style, children, ...props }: Props) {
  const C = useColors()
  const resolvedFamily = family ?? defaultFamily[variant]
  const resolvedWeight = weight ?? defaultWeight[variant]
  const fontFamily = getFontFamily(resolvedFamily, resolvedWeight)
  const { fontSize, lineHeight } = variantStyles[variant]

  return (
    <RNText
      style={[{ fontFamily, fontSize, lineHeight, color: color ?? C.foreground }, style]}
      {...props}
    >
      {children}
    </RNText>
  )
}
