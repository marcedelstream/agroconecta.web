'use client';

import { useState } from 'react';
import { mockCattlePrices, mockInternationalPrices } from '@/lib/mock-data';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Globe, Beef } from 'lucide-react';
import { AppHeader } from '@/components/navigation/app-header';

type PriceTab = 'cattle' | 'international';

export function PricesScreen() {
  const [activeTab, setActiveTab] = useState<PriceTab>('cattle');

  const formatPrice = (price: number, isInternational: boolean = false) => {
    if (isInternational) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(price);
    }
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatChange = (change: number, percent: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col pb-20">
      <AppHeader />
      
      {/* Section header + Tabs */}
      <div className="sticky top-11 z-10 bg-background/95 backdrop-blur-sm px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>Precios del Mercado</h2>
          <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-secondary p-0.5">
          <button
            onClick={() => setActiveTab('cattle')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-all ${
              activeTab === 'cattle'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            }`}
          >
            <Beef className="h-3.5 w-3.5" />
            Ganado
          </button>
          <button
            onClick={() => setActiveTab('international')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-all ${
              activeTab === 'international'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Internacionales
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3">
        {activeTab === 'cattle' ? (
          <div className="flex flex-col gap-2">
            {/* Info mini */}
            <p className="text-[10px] text-muted-foreground mb-1">
              Actualizado: {formatDate(mockCattlePrices[0].updatedAt)}
            </p>

            {/* Cattle prices list */}
            {mockCattlePrices.map((price) => (
              <div
                key={price.id}
                className="flex items-center justify-between rounded-lg bg-card p-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
                    {price.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Por kg en pie</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(price.pricePerKg)}
                  </span>
                  <span className={`flex items-center gap-0.5 text-[10px] font-medium ${getChangeColor(price.change)}`}>
                    {getChangeIcon(price.change)}
                    {formatChange(price.change, price.changePercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Info mini */}
            <p className="text-[10px] text-muted-foreground mb-1">
              Actualizado: {formatDate(mockInternationalPrices[0].updatedAt)}
            </p>

            {/* International prices list */}
            {mockInternationalPrices.map((price) => (
              <div
                key={price.id}
                className="flex items-center justify-between rounded-lg bg-card p-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
                    {price.commodity}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{price.market}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(price.price, true)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{price.unit}</span>
                    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${getChangeColor(price.change)}`}>
                      {getChangeIcon(price.change)}
                      {formatChange(price.change, price.changePercent)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
