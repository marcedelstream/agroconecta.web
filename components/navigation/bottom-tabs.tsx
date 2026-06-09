'use client';

import { useApp, type TabName } from '@/lib/app-context';
import { Home, TrendingUp, Globe, User } from 'lucide-react';

const tabs: { id: TabName; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'prices', label: 'Precios', icon: TrendingUp },
  { id: 'ecosystem', label: 'Ecosistema', icon: Globe },
  { id: 'profile', label: 'Perfil', icon: User },
];

export function BottomTabs() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm safe-area-inset-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'scale-105' : ''}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
