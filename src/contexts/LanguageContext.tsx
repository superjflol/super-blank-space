import { createContext, useState, useContext, ReactNode } from "react";
import { it } from "../locales/it";
import { en } from "../locales/en";

type Locale = "it" | "en";
type Translations = typeof it;

interface LanguageContextType {
  locale: Locale;
  language: Locale;
  translations: Translations;
  setLocale: (locale: Locale) => void;
}

const translations = {
  it,
  en,
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "it",
  language: "it",
  translations: translations.it,
  setLocale: () => {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("it");

  const value: LanguageContextType = {
    locale,
    language: locale,
    translations: translations[locale],
    setLocale,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
