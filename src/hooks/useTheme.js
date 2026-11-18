import { useCallback, useEffect, useState } from 'react'

const THEME_KEY = 'delcom_theme'
const ACCENT_KEY = 'delcom_accent'

export const ACCENTS = ['indigo', 'emerald', 'rose']

const initialTheme = () => {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Tema terang/gelap + aksen warna, disimpan di localStorage & diterapkan ke <html>. */
export default function useTheme() {
  const [theme, setTheme] = useState(initialTheme)
  const [accent, setAccent] = useState(() => localStorage.getItem(ACCENT_KEY) || ACCENTS[0])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem(ACCENT_KEY, accent)
  }, [accent])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, toggleTheme, accent, setAccent }
}
