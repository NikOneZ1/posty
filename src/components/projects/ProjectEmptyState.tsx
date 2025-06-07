import React from "react"

export function ProjectEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-base-content/60">
      <span className="icon-[solar--folder-bold] size-16 text-base-content/40"></span>
      <div className="mt-4 text-lg font-medium">No Projects yet. Create your first project!</div>
    </div>
  )
} 