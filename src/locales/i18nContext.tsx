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
    const saved = localStorage.getItem('app_language') as Language | null;
    return saved === 'en' || saved === 'bn' ? saved : 'bn';
  });

  // Keep DB and localStorage synchronized
  useEffect(() => {
    const saved = localStorage.getItem('app_language') as Language | null;
    if (saved === 'en' || saved === 'bn') {
      db.settings.update('app_settings', { language: saved }).catch(() => {});
    } else {
      db.settings.get('app_settings').then((s) => {
        if (s?.language && (s.language === 'en' || s.language === 'bn')) {
          setLanguageState(s.language);
          localStorage.setItem('app_language', s.language);
        }
      }).catch(() => {});
    }
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
