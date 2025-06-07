"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getProjects, createProject } from "@/api/projects"
import { Project } from "@/types/Project"
import { ProjectGrid } from "@/components/projects/ProjectGrid"
import { ProjectEmptyState } from "@/components/projects/ProjectEmptyState"
import { ProjectCreateModal } from "@/components/projects/ProjectCreateModal"
import notyf from "@/lib/notyf"

export function ProjectList() {
  const { user } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchAll()
    // eslint-disable-next-line
  }, [user])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const data = await getProjects(user!.id)
      setProjects(data)
    } catch {
      notyf?.error("Failed to load projects, try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (form: { name: string; niche: string; description: string; tone: string; platform: 'twitter' | 'linkedin' | 'telegram' }) => {
    if (!user) return
    setCreating(true)
    try {
      const project = await createProject(user.id, form)
      setProjects((prev) => [project, ...prev])
      setShowModal(false)
    } catch {
      notyf?.error("Failed to create project, try again.")
      throw new Error()
    } finally {
      setCreating(false)
    }
  }

  const handleProjectClick = (project: Project) => {
    router.push(`/project/${project.id}`)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-base-content">Your Projects</h1>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-primary"
        >
          New Project
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-20 text-base-content/60 text-lg">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      ) : projects.length === 0 ? (
        <ProjectEmptyState />
      ) : (
        <ProjectGrid projects={projects} onProjectClick={handleProjectClick} />
      )}
      {/* Modal for New Project */}
      <ProjectCreateModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
        creating={creating}
      />
    </div>
  )
} 