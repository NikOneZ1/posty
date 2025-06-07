import React from "react"
import { Project } from "@/types/Project"

interface ProjectCardProps {
  project: Project
  onClick?: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const getPlatformIcon = (platform: Project['platform']) => {
    switch (platform) {
      case 'twitter':
        return <span className="icon-[tabler--brand-x] size-4 text-base-content/60"></span>
      case 'linkedin':
        return <span className="icon-[tabler--brand-linkedin] size-4 text-base-content/60"></span>
      case 'telegram':
        return <span className="icon-[tabler--brand-telegram] size-4 text-base-content/60"></span>
      default:
        return ''
    }
  }

  return (
    <button
      className="text-left bg-base-100 border border-base-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
      onClick={onClick}
      tabIndex={0}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="font-semibold text-lg text-base-content group-hover:text-primary truncate">
          {project.name}
        </div>
        {getPlatformIcon(project.platform)}
      </div>
      {project.niche && (
        <div className="text-xs text-base-content/60 mb-1 truncate">{project.niche}</div>
      )}
      {project.description && (
        <div className="text-xs text-base-content/40 mb-2 line-clamp-2">{project.description}</div>
      )}
    </button>
  )
} 