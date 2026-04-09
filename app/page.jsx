'use client'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/login')
    }, 2000)

    if (!loading) {
      clearTimeout(timeout)
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }

    return () => clearTimeout(timeout)
  }, [user, loading])

  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
      <div className="text-[#00ff88] text-xl font-bold tracking-tight">
        Loading SYMP...
      </div>
    </div>
  )
}
