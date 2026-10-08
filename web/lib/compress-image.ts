// Achica las fotos en el navegador antes de mandarlas al servidor. Vercel corta cualquier envío de más
// de 4,5 MB y una foto de celular pesa 3–10 MB: sin esto, guardar la publicación falla y se pierde todo.
const MAX_SIDE = 1920
const QUALITY = 0.85

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen. Probá con otra (JPG, PNG o WebP).'))
    }
    img.src = url
  })
}

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo elegido no es una imagen.')
  // GIF animados y SVG se perderían al pasar por canvas.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file

  const img = await loadImage(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
  if (scale === 1 && file.size <= 1024 * 1024) return file

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
  if (!blob || blob.size >= file.size) return file
  const name = file.name.replace(/\.[^.]+$/, '') || 'imagen'
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
}
