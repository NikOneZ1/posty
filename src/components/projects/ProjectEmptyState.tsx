import React from "react"
import { FolderIcon } from "@/components/icons/FolderIcon"

export function ProjectEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <FolderIcon />
      <div className="mt-4 text-lg font-medium">No Projects yet. Create your first project!</div>
    </div>
  )
} 