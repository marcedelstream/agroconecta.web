'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ShortVideo } from '@/lib/youtube'

export function ShortCard({ id, title, thumbnail }: ShortVideo) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="shrink-0 w-[170px] md:w-[200px]">
      <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-secondary">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Reproducir: ${title}`}
            className="absolute inset-0 w-full h-full group cursor-pointer"
          >
            {thumbnail && (
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover"
                sizes="200px"
              />
            )}
            <span className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A0A13">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      <p className="text-xs text-muted mt-2 leading-snug line-clamp-2">{title}</p>
    </div>
  )
}
