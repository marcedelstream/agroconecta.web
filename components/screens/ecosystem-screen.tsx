'use client';

import { mockEcosystemSites } from '@/lib/mock-data';
import { ExternalLink, Calendar, Gamepad2, Building2, Radio } from 'lucide-react';
import { AppHeader } from '@/components/navigation/app-header';

export function EcosystemScreen() {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'eventos':
        return <Calendar className="h-4 w-4" />;
      case 'juegos':
        return <Gamepad2 className="h-4 w-4" />;
      case 'institucional':
        return <Building2 className="h-4 w-4" />;
      case 'streaming':
        return <Radio className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'eventos':
        return 'Eventos';
      case 'juegos':
        return 'Juegos';
      case 'institucional':
        return 'Institucional';
      case 'streaming':
        return 'Streaming';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'eventos':
        return 'bg-blue-500/10 text-blue-500';
      case 'juegos':
        return 'bg-purple-500/10 text-purple-500';
      case 'institucional':
        return 'bg-primary/10 text-primary';
      case 'streaming':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="flex flex-col pb-20">
      <AppHeader />
      
      {/* Section header */}
      <div className="sticky top-11 z-10 bg-background/95 backdrop-blur-sm px-4 pt-4 pb-2">
        <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>Ecosistema Digital</h2>
        <p className="text-[10px] text-muted-foreground">
          Tecnologia para el agro paraguayo
        </p>
      </div>

      {/* Content */}
      <div className="px-4 pt-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center rounded-lg bg-card p-2.5">
            <span className="text-lg font-bold text-primary" style={{ fontFamily: 'var(--font-poppins)' }}>3+</span>
            <span className="text-[10px] text-muted-foreground text-center">Productos</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-card p-2.5">
            <span className="text-lg font-bold text-primary" style={{ fontFamily: 'var(--font-poppins)' }}>4</span>
            <span className="text-[10px] text-muted-foreground text-center">En desarrollo</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-card p-2.5">
            <span className="text-lg font-bold text-primary" style={{ fontFamily: 'var(--font-poppins)' }}>1ro</span>
            <span className="text-[10px] text-muted-foreground text-center">Streaming agro</span>
          </div>
        </div>

        {/* Products list */}
        <h2 className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: 'var(--font-poppins)' }}>
          Nuestros productos
        </h2>
        
        <div className="flex flex-col gap-2.5">
          {mockEcosystemSites.map((site) => (
            <a
              key={site.id}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl bg-card p-3 transition-all active:scale-[0.98]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${getCategoryColor(site.category)}`}>
                    {getCategoryIcon(site.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {site.name}
                    </h3>
                    <span className="text-[10px] text-muted-foreground">
                      {getCategoryLabel(site.category)}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {site.description}
              </p>
              
              <div className="mt-2 flex flex-wrap gap-1.5">
                {site.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {site.isLive && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                  </span>
                  <span className="text-[10px] font-medium text-red-500">EN VIVO</span>
                </div>
              )}
            </a>
          ))}
        </div>

        {/* Coming soon */}
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card/50 p-4 text-center">
          <span className="text-2xl font-bold text-primary/30" style={{ fontFamily: 'var(--font-poppins)' }}>4+</span>
          <h3 className="mt-1 text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
            Proyectos en desarrollo
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Remates ganaderos, inmobiliarios rurales y mas.
          </p>
        </div>
      </div>
    </div>
  );
}
