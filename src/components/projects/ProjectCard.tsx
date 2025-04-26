import React from "react"
import { Project } from "@/types/Project"

interface ProjectCardProps {
  project: Project
  onClick?: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <button
      className="text-left bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
      onClick={onClick}
      tabIndex={0}
    >
      <div className="font-semibold text-lg text-gray-900 group-hover:text-black mb-1 truncate">
        {project.name}
      </div>
      {project.niche && (
        <div className="text-xs text-gray-500 mb-1 truncate">{project.niche}</div>
      )}
      {project.description && (
        <div className="text-xs text-gray-400 mb-2 line-clamp-2">{project.description}</div>
      )}
    </button>
  )
} 