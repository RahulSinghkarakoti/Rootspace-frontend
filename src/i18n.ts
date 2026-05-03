import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import hi from './locales/hi.json'

const resources = {
  en: { translation: en },
  hi: { translation: hi },
}

const language = localStorage.getItem('appLanguage') || 'en'

i18n.use(initReactI18next).init({
  resources,
  lng: language,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export function changeLanguage(language: string) {
  localStorage.setItem('appLanguage', language)
  return i18n.changeLanguage(language)
}

export default i18n
