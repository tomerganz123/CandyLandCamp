'use client';

import React from 'react';
import { I18nContext, useI18nSetup } from '@/hooks/useI18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const i18nValue = useI18nSetup();

  return (
    <I18nContext.Provider value={i18nValue}>
      {children}
    </I18nContext.Provider>
  );
}
