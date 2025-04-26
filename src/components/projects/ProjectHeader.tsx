import React from "react"
import { Project } from "@/types/Project"

export function ProjectHeader({ project }: { project: Project }) {
  return (
    <div className="mb-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{project.name}</h1>
      {project.niche && (
        <div className="text-lg text-gray-400 mb-2">{project.niche}</div>
      )}
      {project.description && (
        <div className="text-sm text-gray-400 mb-4 whitespace-pre-line">{project.description}</div>
      )}
    </div>
  )
} 