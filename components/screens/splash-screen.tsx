'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useApp } from '@/lib/app-context';

export function SplashScreen() {
  const { setCurrentScreen } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen('onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, [setCurrentScreen]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      {/* Logo animation - mas compacto */}
      <div className="animate-in fade-in zoom-in duration-700">
        <Image
          src="/logo.png"
          alt="Agroconecta"
          width={160}
          height={48}
          className="h-auto w-40"
          priority
        />
      </div>
      
      {/* Loading indicator */}
      <div className="absolute bottom-20 flex flex-col items-center gap-4">
        <div className="h-0.5 w-16 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-full bg-primary origin-left" 
               style={{ animation: 'loading 2s ease-in-out' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
}
