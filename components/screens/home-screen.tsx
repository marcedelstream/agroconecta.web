'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useApp } from '@/lib/app-context';
import { mockNews, newsCategories, getCategoryLabel } from '@/lib/mock-data';
import type { NewsCategory, NewsArticle } from '@/lib/types';
import { Clock, ChevronRight, Search, SlidersHorizontal, X, Check } from 'lucide-react';
import { AppHeader } from '@/components/navigation/app-header';

export function HomeScreen() {
  const { user } = useApp();
  const [activeFilters, setActiveFilters] = useState<NewsCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Toggle category filter
  const toggleFilter = (cat: NewsCategory) => {
    setActiveFilters(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  // Filter news based on active filters and search
  const filteredNews = mockNews.filter(news => {
    const matchesFilter = activeFilters.length === 0 || activeFilters.includes(news.category);
    const matchesSearch = searchQuery === '' || 
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort to show preferred categories first
  const sortedNews = [...filteredNews].sort((a, b) => {
    if (user?.preferences.length) {
      const aIsPref = user.preferences.includes(a.category);
      const bIsPref = user.preferences.includes(b.category);
      if (aIsPref && !bIsPref) return -1;
      if (!aIsPref && bIsPref) return 1;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const highlightedNews = sortedNews.find(n => n.isHighlighted) || sortedNews[0];
  const regularNews = sortedNews.filter(n => n.id !== highlightedNews?.id);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  };

  return (
    <div className="flex flex-col pb-20">
      <AppHeader />
      
      {/* Search bar + filters */}
      <div className="sticky top-11 z-10 bg-background/95 backdrop-blur-sm px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar noticias o publicadores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-secondary py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative flex items-center justify-center text-primary"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeFilters.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Filtros desplegables */}
        {showFilters && (
          <div className="mt-3 rounded-xl bg-secondary p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Filtrar por categoria</span>
              {activeFilters.length > 0 && (
                <button 
                  onClick={() => setActiveFilters([])}
                  className="text-xs text-primary"
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {newsCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => toggleFilter(cat.value)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    activeFilters.includes(cat.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground'
                  }`}
                >
                  {activeFilters.includes(cat.value) && <Check className="h-3 w-3" />}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="px-4 pt-3">
        {/* Highlighted news - mas compacto */}
        {highlightedNews && (
          <article className="group relative mb-4 overflow-hidden rounded-xl bg-card">
            <div className="aspect-[16/9] relative">
              <Image
                src={highlightedNews.imageUrl}
                alt={highlightedNews.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <span className="inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                {getCategoryLabel(highlightedNews.category)}
              </span>
              <h2 className="mt-1.5 text-sm font-semibold leading-tight text-white" style={{ fontFamily: 'var(--font-poppins)' }}>
                {highlightedNews.title}
              </h2>
              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-white/70">
                <span>{highlightedNews.source}</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {highlightedNews.readTime} min
                </span>
                <span>{formatDate(highlightedNews.publishedAt)}</span>
              </div>
            </div>
          </article>
        )}

        {/* News list - mas compacto */}
        <div className="flex flex-col gap-2.5">
          {regularNews.map((news) => (
            <NewsCard key={news.id} news={news} formatDate={formatDate} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NewsCard({ news, formatDate }: { news: NewsArticle; formatDate: (date: Date) => string }) {
  return (
    <article className="group flex gap-3 rounded-lg bg-card p-2.5 transition-all active:scale-[0.98]">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={news.imageUrl}
          alt={news.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div>
          <span className="text-[10px] font-medium text-primary">
            {getCategoryLabel(news.category)}
          </span>
          <h3 className="mt-0.5 line-clamp-2 text-xs font-semibold leading-tight text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
            {news.title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>{news.source}</span>
          <span>·</span>
          <span>{formatDate(news.publishedAt)}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 self-center text-muted-foreground" />
    </article>
  );
}
