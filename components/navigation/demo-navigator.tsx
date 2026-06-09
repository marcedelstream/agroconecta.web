'use client';

import { useState } from 'react';
import { useApp, type Screen, type TabName } from '@/lib/app-context';
import { Layers, X, Play, Home, TrendingUp, Globe, User, Sparkles } from 'lucide-react';

type NavigationTarget = {
  type: 'screen';
  screen: Screen;
  label: string;
  icon: typeof Play;
} | {
  type: 'tab';
  tab: TabName;
  label: string;
  icon: typeof Home;
};

const navigationItems: NavigationTarget[] = [
  { type: 'screen', screen: 'splash', label: 'Splash', icon: Sparkles },
  { type: 'screen', screen: 'onboarding', label: 'Onboarding', icon: Play },
  { type: 'tab', tab: 'home', label: 'Home', icon: Home },
  { type: 'tab', tab: 'prices', label: 'Precios', icon: TrendingUp },
  { type: 'tab', tab: 'ecosystem', label: 'Ecosistema', icon: Globe },
  { type: 'tab', tab: 'profile', label: 'Perfil', icon: User },
];

export function DemoNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const { setCurrentScreen, setActiveTab, currentScreen, activeTab, resetOnboarding } = useApp();

  const handleNavigate = (target: NavigationTarget) => {
    if (target.type === 'screen') {
      if (target.screen === 'onboarding') {
        resetOnboarding();
      } else {
        setCurrentScreen(target.screen);
      }
    } else {
      setCurrentScreen('main');
      setActiveTab(target.tab);
    }
    setIsOpen(false);
  };

  const getCurrentLabel = () => {
    if (currentScreen === 'splash') return 'Splash';
    if (currentScreen === 'onboarding') return 'Onboarding';
    return navigationItems.find(item => item.type === 'tab' && item.tab === activeTab)?.label || 'Home';
  };

  return (
    <>
      {/* FAB Button - mas compacto */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-3 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all active:scale-95"
        aria-label="Navegador de demo"
      >
        <Layers className="h-4 w-4" />
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed bottom-0 left-0 right-0 z-[101] rounded-t-2xl bg-card p-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
                  Navegador Demo
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Actual: {getCurrentLabel()}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = 
                  (item.type === 'screen' && currentScreen === item.screen) ||
                  (item.type === 'tab' && currentScreen === 'main' && activeTab === item.tab);
                
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item)}
                    className={`flex flex-col items-center gap-1 rounded-lg p-2.5 transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-center text-[10px] text-muted-foreground">
              Solo para navegar el mockup
            </p>
          </div>
        </>
      )}
    </>
  );
}
