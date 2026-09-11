import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from '~/data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const stored = localStorage.getItem('vynex-lang');
    if (stored && translations[stored]) {
      setLang(stored);
    }
  }, []);

  function changeLang(code) {
    setLang(code);
    localStorage.setItem('vynex-lang', code);
  }

  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
