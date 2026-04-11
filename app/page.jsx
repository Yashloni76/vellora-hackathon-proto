"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      // Check if user has completed onboarding by checking income in users table
      const { data: userRecord } = await supabase
        .from('users')
        .select('income, goal')
        .eq('id', session.user.id)
        .single()

      if (userRecord && userRecord.income > 0) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    }

    checkUser()
  }, [])

  return null
}
