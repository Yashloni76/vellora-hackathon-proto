'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true)

  const applyTheme = (dark) => {
    const root = document.documentElement
    if (dark) {
      root.classList.remove('light')
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    localStorage.setItem('symp-theme', dark ? 'dark' : 'light')
  }

  const toggleTheme = (dark) => {
    setIsDark(dark)
    applyTheme(dark)
  }

  useEffect(() => {
    const saved = localStorage.getItem('symp-theme')
    const dark = saved !== 'light'
    setIsDark(dark)
    applyTheme(dark)
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
