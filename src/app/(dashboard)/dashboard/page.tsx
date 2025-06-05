"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ProjectList } from "@/components/ProjectList"

export default function DashboardPage() {
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
