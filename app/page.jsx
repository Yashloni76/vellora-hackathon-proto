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

      const { data: income } = await supabase
        .from('income')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1)

      if (!income || income.length === 0) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    }

    checkUser()
  }, [])

  return null
}
