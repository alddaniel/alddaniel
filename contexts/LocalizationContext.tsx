import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';

export type Language = 'en' | 'pt' | 'es';
export type Locale = 'en-US' | 'pt-BR' | 'es-AR';

interface LocalizationContextValue {
    language: Language;
    locale: Locale;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: { [key: string]: string | number }) => string;
}

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

// Function to get the browser's preferred language
const getInitialLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    if (['en', 'pt', 'es'].includes(browserLang)) {
        return browserLang as Language;
    }
    return 'pt'; // Default to Portuguese
};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        return (localStorage.getItem('language') as Language) || getInitialLanguage();
    });

    const [translations, setTranslations] = useState<{ [key: string]: any } | null>(null);

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const [en, pt, es] = await Promise.all([
                    fetch('./locales/en.json').then(res => res.json()),
                    fetch('./locales/pt.json').then(res => res.json()),
                    fetch('./locales/es.json').then(res => res.json()),
                ]);
                setTranslations({ en, pt, es });
            } catch (error) {
                console.error("Failed to load translation files:", error);
                // Fallback to empty translations to prevent app crash
                setTranslations({ en: {}, pt: {}, es: {} });
            }
        };
        fetchTranslations();
    }, []);


    const setLanguage = (lang: Language) => {
        localStorage.setItem('language', lang);
        setLanguageState(lang);
    };

    const t = (key: string, params?: { [key: string]: string | number }): string => {
        if (!translations) {
            return key; // Return key while loading
        }
        
        const keys = key.split('.');
        let result = translations[language];
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) {
                // Fallback to English if translation is missing
                let fallbackResult = translations['en'];
                for (const fk of keys) {
                    fallbackResult = fallbackResult?.[fk];
                }
                if(fallbackResult === undefined) return key; // return key if not found anywhere
                result = fallbackResult;
                break;
            }
        }

        if (typeof result === 'string' && params) {
            return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
                return acc.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
            }, result);
        }

        return result || key;
    };
    
    const locale = useMemo((): Locale => {
        switch (language) {
            case 'en': return 'en-US';
            case 'pt': return 'pt-BR';
            case 'es': return 'es-AR';
            default: return 'pt-BR';
        }
    }, [language]);

    if (!translations) {
        // Render nothing or a loading spinner while translations are loading
        return null;
    }

    return (
        <LocalizationContext.Provider value={{ language, locale, setLanguage, t }}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = (): LocalizationContextValue => {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};
