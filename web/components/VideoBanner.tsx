interface Props {
  className?: string
}

// Banner de auspiciante (video corto en loop, 1600x200 — CONGRESO CEA). Sin controles ni sonido,
// para que se comporte como un banner de imagen animada, no como un reproductor de video.
export function VideoBanner({ className = '' }: Props) {
  return (
    <video
      src="/banners/congreso-cea.mp4"
      autoPlay
      loop
      muted
      playsInline
      disablePictureInPicture
      controls={false}
      aria-label="Congreso CEA"
      className={`w-full rounded-xl aspect-[8/1] object-cover bg-secondary ${className}`}
    />
  )
}
