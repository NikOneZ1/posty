"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { ProjectList } from "@/components/ProjectList"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <main className="max-w-5xl mx-auto px-4 py-10">
          <ProjectList />
        </main>
      </div>
    </ProtectedRoute>
  )
}
