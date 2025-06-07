"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import notyf from "@/lib/notyf"

export default function LoginPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Attempting to sign in with OTP...');
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      })

      if (error) {
        notyf?.error(error.message)
      } else {
        notyf?.success("Check your email for the magic link!")
      }
    } catch (err) {
      console.error('Error signing in:', err);
      notyf?.error("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="card md pt-15 pb-15 pl-5 pr-5 gap-5 flex flex-col items-center justify-center">
        <div className="flex flex-row items-center justify-center gap-2">
          <span className="icon-[solar--lock-bold] size-10 text-primary"></span>
          <h1 className="text-base-content text-3xl font-semibold">Sign in to Posty</h1>
        </div>
        <p className="text-base-content/60">Enter your email to continue</p>
        <input 
          required 
          type="email" 
          placeholder="Your email" 
          className="input max-w-sm" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          name="email"
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="btn btn-primary w-full"
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>
        <p className="text-base-content/60">No account? It will be created automatically</p>
      </form>
    </div>
  )
}
