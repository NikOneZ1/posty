"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function CTABanner() {
  const { user, session } = useAuth()
  const href = user && session ? "/dashboard" : "/login"

  return (
    <section className="bg-base-200 py-16">
      <div className="container mx-auto px-4 text-center space-y-4">
        <h2 className="text-3xl font-bold text-base-content">
          Ready to publish smarter?
        </h2>
        <p className="text-base-content/70">
          Sign in and turn your first idea into content in seconds.
        </p>
        <Link href={href} className="btn btn-primary">
          Start Creating
        </Link>
      </div>
    </section>
  )
}
