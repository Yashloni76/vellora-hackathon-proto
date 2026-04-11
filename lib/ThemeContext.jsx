'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const [isDark, setIsDark] = useState(true)

  const applyTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.remove('light-mode')
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.documentElement.classList.add('light-mode')
    }
  }

  const toggleTheme = async (dark) => {
    setIsDark(dark)
    applyTheme(dark)
    localStorage.setItem('symp-theme', dark ? 'dark' : 'light')
    
    // Also persist to Supabase if user is logged in
    if (user) {
      await supabase
        .from('users')
        .update({ theme: dark ? 'dark' : 'light' })
        .eq('id', user.id)
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('symp-theme')
    
    // Initial load from local storage
    if (saved) {
      const dark = saved !== 'light'
      setIsDark(dark)
      applyTheme(dark)
    } else {
      // Default to dark
      applyTheme(true)
    }
  }, [])

  // Sync with Supabase when user loads
  useEffect(() => {
    const loadTheme = async () => {
      const { data } = await supabase
        .from('users')
        .select('theme')
        .eq('id', user.id)
        .single()
      
      if (data?.theme) {
        const dark = data.theme === 'dark'
        setIsDark(dark)
        applyTheme(dark)
        localStorage.setItem('symp-theme', data.theme)
      }
    }
    if (user) loadTheme()
  }, [user])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
