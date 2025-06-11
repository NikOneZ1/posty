"use client"

import { useEffect, useState, ChangeEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getProjectById, updateProject } from "@/api/projects"
import { Project } from "@/types/Project"
import { Idea } from "@/types/Idea"
import { GeneratedIdeasList } from "@/components/projects/GeneratedIdeasList"
import { IdeaInputForm } from "@/components/projects/IdeaInputForm"
import { IdeaFilterModal } from "@/components/projects/IdeaFilterModal"
import { useIdeas } from "@/hooks/useIdeas"
import { toast } from "sonner"

export default function ProjectDetailPage() {
  const { user, loading: authLoading, session } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id as string | undefined

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Project>>({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [filterStatus, setFilterStatus] = useState<Idea['status'] | 'all'>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const {
    ideas,
    loading: ideasLoading,
    error: ideasError,
    generating,
    createError,
    deleteError,
    generateError,
    fetchIdeas,
    createIdea,
    deleteIdea: deleteIdeaById,
    generateIdeas,
  } = useIdeas({
    projectId: projectId ?? "",
    userId: user?.id ?? "",
    accessToken: session?.access_token ?? "",
    enabled: Boolean(projectId && user?.id && session?.access_token)
  })

  const handleDeleteIdea = (idea: Idea) => {
    deleteIdeaById(idea.id)
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (!projectId) return
    fetchProject()
    fetchIdeas()
    // eslint-disable-next-line
  }, [user, authLoading, projectId])

  const fetchProject = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getProjectById(projectId!, user!.id)
      if (!data) {
        setError("Project not found. Go back to dashboard.")
        setProject(null)
      } else {
        setProject(data)
      }
    } catch {
      setError("Not authorized to view this project.")
      setProject(null)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!project || !user) return
    setIsUpdating(true)
    try {
      const updatedProject = await updateProject(project.id, user.id, editForm)
      setProject(updatedProject)
      setIsEditModalOpen(false)
      toast.success("Project updated successfully")
    } catch (error) {
      toast.error("Failed to update project")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const openEditModal = () => {
    if (!project) return
    setEditForm({
      name: project.name,
      description: project.description,
      niche: project.niche,
      platform: project.platform,
      tone: project.tone,
    })
    setIsEditModalOpen(true)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleDeleteProject = async () => {
    if (!project || !user || !session?.access_token) return
    
    const confirmed = window.confirm("Are you sure you want to delete this project? This action cannot be undone.")
    if (!confirmed) return

    try {
      const response = await fetch("/api/projects/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ projectId: project.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      toast.success("Project deleted successfully")
      router.push("/dashboard")
    } catch (error) {
      toast.error("Failed to delete project")
      console.error(error)
    }
  }

  const filteredIdeas = ideas.filter((idea) => {
    if (!showArchived && idea.status === 'archived') return false
    if (filterStatus !== 'all' && idea.status !== filterStatus) return false
    return true
  })

  return (
    <div className="min-h-screen">
      <main className="container mx-auto max-w-3xl p-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20 text-base-content/60">
            <div className="loading loading-spinner loading-lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-error">
            <span className="icon-[tabler--alert-circle] mb-4 size-8" />
            {error}
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 link"
            >
              Go back to dashboard
            </button>
          </div>
        ) : project ? (
          <>
            <div className="card bg-base-100 shadow-sm mb-8">
              <div className="card-body">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-base-content">{project.name}</h1>
                    <p className="text-base-content/60">{project.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={openEditModal} className="btn btn-neutral btn-sm sm:btn-md">Edit</button>
                    <button onClick={handleDeleteProject} className="btn btn-error btn-sm sm:btn-md">Delete</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div><span className="font-medium">Niche:</span> {project.niche || 'Not set'}</div>
                  <div><span className="font-medium">Platform:</span> <span className="capitalize">{project.platform}</span></div>
                  <div><span className="font-medium">Tone:</span> {project.tone || 'Not set'}</div>
                </div>
              </div>
            </div>

            <div className="mb-8 flex justify-end">
              <button onClick={generateIdeas} disabled={generating} className="btn btn-primary">
                {generating ? 'Generating...' : 'Generate Ideas'}
              </button>
            </div>
            {(generateError || deleteError || createError || ideasError) && (
              <div className="space-y-1 text-error text-sm mb-6">
                {generateError && <div>{generateError}</div>}
                {deleteError && <div>{deleteError}</div>}
                {createError && <div>{createError}</div>}
                {ideasError && <div>{ideasError}</div>}
              </div>
            )}

            <IdeaInputForm onSubmit={createIdea} disabled={generating} />

            {ideasLoading ? (
              <div className="flex justify-center py-10 text-base-content/60">
                <div className="loading loading-spinner" />
              </div>
            ) : (
              <GeneratedIdeasList
                ideas={filteredIdeas}
                onDelete={handleDeleteIdea}
                projectId={projectId!}
                onFilterClick={() => setIsFilterModalOpen(true)}
              />
            )}
          </>
        ) : null}
      </main>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-md card bg-base-100 p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
            <div className="space-y-4">
              <div>
                <label className="label-text" htmlFor="edit-name">Name</label>
                <input
                  id="edit-name"
                  name="name"
                  className="input w-full"
                  value={editForm.name || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="label-text" htmlFor="edit-description">Description</label>
                <input
                  id="edit-description"
                  name="description"
                  className="input w-full"
                  value={editForm.description || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="label-text" htmlFor="edit-niche">Niche</label>
                <input
                  id="edit-niche"
                  name="niche"
                  className="input w-full"
                  value={editForm.niche || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="label-text" htmlFor="edit-platform">Platform</label>
                <select
                  id="edit-platform"
                  name="platform"
                  className="select w-full"
                  value={editForm.platform || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, platform: e.target.value as Project['platform'] }))}
                >
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>
              <div>
                <label className="label-text" htmlFor="edit-tone">Tone</label>
                <input
                  id="edit-tone"
                  name="tone"
                  className="input w-full"
                  value={editForm.tone || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary" disabled={isUpdating}>
                  Cancel
                </button>
                <button onClick={handleEditSubmit} className="btn btn-primary" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <IdeaFilterModal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialStatus={filterStatus}
        showArchived={showArchived}
        onApply={(status, archived) => {
          setFilterStatus(status)
          setShowArchived(archived)
        }}
      />
    </div>
  )
}
