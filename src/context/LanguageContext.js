'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../lib/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('az')

  useEffect(() => {
    const saved = localStorage.getItem('frila_lang')
    if (saved && translations[saved]) {
      setLang(saved)
    }
  }, [])

  const changeLang = (newLang) => {
    setLang(newLang)
    localStorage.setItem('frila_lang', newLang)
  }

  const t = (key) => translations[lang]?.[key] || translations.az[key] || key

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}