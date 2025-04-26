"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getProjects, createProject } from "@/api/projects"
import { Project } from "@/types/Project"
import { Button } from "@/components/ui/Button"
import { ProjectGrid } from "@/components/projects/ProjectGrid"
import { ProjectEmptyState } from "@/components/projects/ProjectEmptyState"
import { ProjectCreateModal } from "@/components/projects/ProjectCreateModal"

export function ProjectList() {
  const { user } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchAll()
    // eslint-disable-next-line
  }, [user])

  const fetchAll = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getProjects(user!.id)
      setProjects(data)
    } catch {
      setError("Failed to load projects, try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (form: { name: string; niche: string; description: string; tone: string }) => {
    if (!user) return
    setCreating(true)
    setError("")
    try {
      const project = await createProject(user.id, form)
      setProjects((prev) => [project, ...prev])
      setShowModal(false)
    } catch {
      setError("Failed to create project, try again.")
      throw new Error()
    } finally {
      setCreating(false)
    }
  }

  const handleProjectClick = (project: Project) => {
    router.push(`/project/${project.id}`)
  }

  return (
    <div>
      {/* Title + Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
        <Button onClick={() => setShowModal(true)}>New Project</Button>
      </div>
      {/* Loading/Error/Empty/Grid */}
      {loading ? (
        <div className="flex justify-center py-20 text-gray-400 text-lg">Loading...</div>
      ) : error ? (
        <div className="flex justify-center py-20 text-red-400 text-lg">{error}</div>
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