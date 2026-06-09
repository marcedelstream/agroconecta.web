'use client';

import { useApp } from '@/lib/app-context';
import { HomeScreen } from './home-screen';
import { PricesScreen } from './prices-screen';
import { EcosystemScreen } from './ecosystem-screen';
import { ProfileScreen } from './profile-screen';
import { BottomTabs } from '@/components/navigation/bottom-tabs';

export function MainScreen() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-background">
      {/* Tab content */}
      <main>
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'prices' && <PricesScreen />}
        {activeTab === 'ecosystem' && <EcosystemScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </main>

      {/* Bottom navigation */}
      <BottomTabs />
    </div>
  );
}
