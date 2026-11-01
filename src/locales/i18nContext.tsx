import React, { createContext, useContext, useState, useEffect } from 'react';
import { bn, TranslationKey } from './bn';
import { en } from './en';
import { db } from '../db';

export type Language = 'bn' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'bn';
  });

  // Load language preference from DB on start if available
  useEffect(() => {
    db.settings.get('app_settings').then((settings) => {
      if (settings?.language && (settings.language === 'bn' || settings.language === 'en')) {
        setLanguageState(settings.language as Language);
        localStorage.setItem('app_language', settings.language);
      }
    }).catch(() => {});
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    db.settings.update('app_settings', { language: lang }).catch(() => {});
  };

  const toggleLanguage = () => {
    const nextLang = language === 'bn' ? 'en' : 'bn';
    setLanguage(nextLang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = language === 'bn' ? bn : en;
    let text = dict[key] || bn[key] || (key as string);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
