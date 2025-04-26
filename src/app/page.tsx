"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Handle the authentication callback
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        router.push("/dashboard")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Posty</h1>
      <p className="mb-4">Please login to continue</p>
      <a href="/login" className="bg-black text-white rounded p-3">
        Go to Login
      </a>
    </div>
  )
}
