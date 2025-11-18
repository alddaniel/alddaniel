import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { i18n, Language } from '../i18n'; // The new central module

interface LocalizationContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
  locale: string;
}

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // The state in this component now just mirrors the language from the i18n manager
  // to trigger React re-renders when it changes.
  const [language, setLanguageState] = useState(i18n.getLanguage());

  useEffect(() => {
    // Subscribe to changes in the i18n manager
    const unsubscribe = i18n.subscribe(() => {
      setLanguageState(i18n.getLanguage());
    });
    // Unsubscribe on cleanup
    return unsubscribe;
  }, []);

  const contextValue = useMemo(() => ({
    language: language,
    setLanguage: i18n.setLanguage, // Directly use the manager's method
    t: i18n.t, // Directly use the manager's method
    locale: i18n.getLocale(), // Get the current locale from the manager
  }), [language]);

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextValue => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

export type { Language };
