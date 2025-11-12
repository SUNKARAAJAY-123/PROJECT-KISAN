import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations, LanguageCode } from '../translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  translations: typeof translations.en;
}

const defaultLanguageContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  translations: translations.en
};

export const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext);

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const getInitialLanguage = (): LanguageCode => {
    const stored = localStorage.getItem('selected_language');
    return (stored as LanguageCode) || 'en';
  };
  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage());

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('selected_language', lang);
  };

  const value = {
    language,
    setLanguage,
    translations: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};