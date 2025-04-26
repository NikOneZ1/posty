"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { ProjectList } from "@/components/ProjectList"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 h-14 border-b border-gray-100">
          <span className="font-bold text-lg tracking-tight">Posty</span>
          <button
            onClick={handleLogout}
            className="text-gray-500 text-sm px-3 py-1 rounded hover:text-gray-900 transition-colors"
          >
            Logout
          </button>
        </nav>
        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 py-10">
          <ProjectList />
        </main>
      </div>
    </ProtectedRoute>
  )
}
