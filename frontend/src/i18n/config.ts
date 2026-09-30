import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

export const defaultNS = "common";
export const resources = {
  en: { common: en },
  ar: { common: ar },
} as const;

export type SupportedLanguage = "en" | "ar";

const initialLanguage: SupportedLanguage = "ar";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: "ar",
    fallbackLng: "ar",
    defaultNS: "common",
    resources,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
