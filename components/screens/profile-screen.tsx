'use client';

import Image from 'next/image';
import { useApp } from '@/lib/app-context';
import { getDepartmentLabel, getProfessionLabel, newsCategories } from '@/lib/mock-data';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Heart, 
  Settings, 
  Bell, 
  Moon, 
  ChevronRight,
  Shield
} from 'lucide-react';
import { AppHeader } from '@/components/navigation/app-header';

export function ProfileScreen() {
  const { user } = useApp();

  if (!user) return null;

  const userPreferencesLabels = user.preferences
    .map(p => newsCategories.find(c => c.value === p)?.label)
    .filter(Boolean)
    .join(', ');

  return (
    <div className="flex flex-col pb-20">
      <AppHeader />
      
      {/* Section header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>Tu Perfil</h2>
      </div>

      {/* User card */}
      <div className="px-4">
        <div className="flex items-center gap-3 rounded-xl bg-card p-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
              {user.name}
            </h2>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {getProfessionLabel(user.profession)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {getDepartmentLabel(user.department)}
              </span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="mt-3 rounded-xl bg-card p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Heart className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
              Tus intereses
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.preferences.map((pref) => {
              const category = newsCategories.find(c => c.value === pref);
              return (
                <span
                  key={pref}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary"
                >
                  {category?.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Settings menu */}
        <div className="mt-3 rounded-xl bg-card overflow-hidden">
          <h3 className="px-3 pt-3 pb-2 text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
            Configuracion
          </h3>
          
          <MenuItem 
            icon={<Bell className="h-4 w-4" />} 
            label="Notificaciones" 
            subtitle="Gestiona tus alertas"
          />
          <MenuItem 
            icon={<Moon className="h-4 w-4" />} 
            label="Apariencia" 
            subtitle="Modo oscuro activado"
          />
          <MenuItem 
            icon={<Shield className="h-4 w-4" />} 
            label="Privacidad" 
            subtitle="Tus datos seguros"
          />
          <MenuItem 
            icon={<Settings className="h-4 w-4" />} 
            label="Preferencias" 
            subtitle="Ajusta tu experiencia"
          />
        </div>

        {/* About section */}
        <div className="mt-3 rounded-xl bg-card p-3">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Agroconecta"
              width={100}
              height={30}
              className="h-5 w-auto opacity-50"
            />
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Version 1.0.0 - Ecosistema Digital Agropecuario
          </p>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ 
  icon, 
  label, 
  subtitle 
}: { 
  icon: React.ReactNode; 
  label: string; 
  subtitle: string;
}) {
  return (
    <button className="flex w-full items-center gap-2.5 px-3 py-2.5 transition-colors active:bg-secondary/50">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <p className="text-[10px] text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
