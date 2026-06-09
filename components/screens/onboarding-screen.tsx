'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useApp } from '@/lib/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { professions, departments, newsCategories } from '@/lib/mock-data';
import type { Profession, Department, NewsCategory } from '@/lib/types';
import { ChevronLeft, ChevronRight, Check, User, Briefcase, MapPin, Heart } from 'lucide-react';

const TOTAL_STEPS = 4;

export function OnboardingScreen() {
  const { onboarding, updateOnboarding, completeOnboarding } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return onboarding.name.trim().length >= 2;
      case 1:
        return onboarding.profession !== null;
      case 2:
        return onboarding.department !== null;
      case 3:
        return onboarding.preferences.length >= 1;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const togglePreference = (category: NewsCategory) => {
    const current = onboarding.preferences;
    if (current.includes(category)) {
      updateOnboarding({ preferences: current.filter(c => c !== category) });
    } else {
      updateOnboarding({ preferences: [...current, category] });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header compacto */}
      <header className="flex items-center justify-between px-4 pt-10 pb-4">
        <div className="w-8">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
        <Image
          src="/logo.png"
          alt="Agroconecta"
          width={100}
          height={30}
          className="h-6 w-auto"
        />
        <div className="w-8" />
      </header>

      {/* Progress bar */}
      <div className="px-4">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                i <= currentStep ? 'bg-primary' : 'bg-secondary'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-4 pt-6">
        {/* Welcome message - only on first step */}
        {currentStep === 0 && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
              Una nueva forma de vivir el{' '}
              <span className="text-primary">agro</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Configuremos tu experiencia en pocos pasos
            </p>
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1">
          {/* Step 0: Name */}
          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
                    Como te llamas?
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Asi personalizaremos tu experiencia
                  </p>
                </div>
              </div>
              <Input
                type="text"
                placeholder="Tu nombre"
                value={onboarding.name}
                onChange={(e) => updateOnboarding({ name: e.target.value })}
                className="h-11 rounded-lg border-border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>
          )}

          {/* Step 1: Profession */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
                    Cual es tu profesion?
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Selecciona la que mas te representa
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {professions.map((prof) => (
                  <button
                    key={prof.value}
                    onClick={() => updateOnboarding({ profession: prof.value })}
                    className={`flex h-10 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-all ${
                      onboarding.profession === prof.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary text-foreground'
                    }`}
                  >
                    {prof.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Department */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
                    De que departamento sos?
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Para mostrarte info relevante
                  </p>
                </div>
              </div>
              <div className="max-h-[50vh] overflow-y-auto rounded-lg">
                <div className="grid grid-cols-2 gap-2 pb-2">
                  {departments.map((dept) => (
                    <button
                      key={dept.value}
                      onClick={() => updateOnboarding({ department: dept.value })}
                      className={`flex h-9 items-center justify-center rounded-lg border px-2 text-xs font-medium transition-all ${
                        onboarding.department === dept.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-secondary text-foreground'
                      }`}
                    >
                      {dept.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
                    Que temas te interesan?
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Selecciona al menos uno
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {newsCategories.map((cat) => {
                  const isSelected = onboarding.preferences.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      onClick={() => togglePreference(cat.value)}
                      className={`relative flex h-14 flex-col items-center justify-center rounded-lg border px-3 text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-secondary text-foreground'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                          <Check className="h-2.5 w-2.5 text-primary-foreground" />
                        </div>
                      )}
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pb-6 pt-4">
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-40"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            {currentStep === TOTAL_STEPS - 1 ? (
              <span className="flex items-center gap-1.5">
                Comenzar <Check className="h-4 w-4" />
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Continuar <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
