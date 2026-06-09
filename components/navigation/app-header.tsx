'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Menu, X, Bell, Settings, HelpCircle, Info, LogOut } from 'lucide-react';
import { useApp } from '@/lib/app-context';

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { resetOnboarding } = useApp();

  const menuItems = [
    { icon: Bell, label: 'Notificaciones', action: () => {} },
    { icon: Settings, label: 'Configuracion', action: () => {} },
    { icon: HelpCircle, label: 'Ayuda', action: () => {} },
    { icon: Info, label: 'Acerca de', action: () => {} },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between bg-background/95 backdrop-blur-sm px-4 py-3 border-b border-border/50">
        <Image
          src="/logo.png"
          alt="Agroconecta"
          width={100}
          height={30}
          className="h-5 w-auto"
          priority
        />
        <button
          onClick={() => setMenuOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground"
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </header>

      {/* Menu overlay */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMenuOpen(false)}
          />
          
          <div className="fixed top-0 right-0 bottom-0 z-[201] w-64 bg-card animate-in slide-in-from-right duration-300">
            {/* Menu header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
                Menu
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Menu items */}
            <div className="p-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.action();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors active:bg-secondary"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Logout at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <button
                onClick={() => {
                  resetOnboarding();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive/10 py-2.5 text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs font-medium">Cerrar sesion</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
