import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'

// Genera la imagen OG de marca por default (fondo azul oscuro + logo blanco + frase). Se pega
// una vez en public/og-default.png — este endpoint queda para poder regenerarla si cambia el
// texto o el diseño, sin tener que armar el PNG a mano.
export async function GET() {
  const logoData = await readFile(path.join(process.cwd(), 'public', 'logo-dark.png'))
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A1720',
          gap: '36px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={420} height={90} alt="Agroconecta" style={{ objectFit: 'contain' }} />
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.5px',
          }}
        >
          Una nueva forma de vivir el agro
        </div>
        <div style={{ width: '120px', height: '4px', backgroundColor: '#A4D233', borderRadius: '9999px' }} />
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
