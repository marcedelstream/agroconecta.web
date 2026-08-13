import Pdf from 'react-native-pdf'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof Pdf>

// react-native-pdf no tiene build para web — este wrapper deja que Metro resuelva
// PdfReader.web.tsx en esa plataforma (ver ese archivo) sin duplicar book/[id].tsx entero.
export function PdfReader(props: Props) {
  return <Pdf {...props} />
}
