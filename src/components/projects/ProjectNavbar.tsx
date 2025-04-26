import React from "react"

interface ProjectNavbarProps {
  onBack: () => void
  onLogout: () => void
}

export function ProjectNavbar({ onBack, onLogout }: ProjectNavbarProps) {
  return (
    <nav className="flex items-center justify-between px-6 h-14 border-b border-gray-100 mb-10">
      <button
        onClick={onBack}
        className="text-gray-500 text-sm hover:text-black transition-colors"
      >
        ← Back to Dashboard
      </button>
      <button
        onClick={onLogout}
        className="text-gray-500 text-sm px-3 py-1 rounded hover:text-gray-900 transition-colors"
      >
        Logout
      </button>
    </nav>
  )
} 