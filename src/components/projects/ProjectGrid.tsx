import React from "react"
import { Project } from "@/types/Project"
import { ProjectCard } from "./ProjectCard"

interface ProjectGridProps {
  projects: Project[]
  onProjectClick?: (project: Project) => void
}

export function ProjectGrid({ projects, onProjectClick }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={onProjectClick ? () => onProjectClick(project) : undefined}
        />
      ))}
    </div>
  )
} 