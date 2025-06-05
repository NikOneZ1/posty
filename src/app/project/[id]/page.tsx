"use client"

import { useEffect, useState, ChangeEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getProjectById, updateProject } from "@/api/projects"
import { Project } from "@/types/Project"
import { Idea } from "@/types/Idea"
import { Button } from "@/components/ui/Button"
import { ProjectNavbar } from "@/components/projects/ProjectNavbar"
import { GeneratedIdeasList } from "@/components/projects/GeneratedIdeasList"
import { IdeaInputForm } from "@/components/projects/IdeaInputForm"
import { useIdeas } from "@/hooks/useIdeas"
import { toast } from "sonner"
import { Dialog } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"

export default function ProjectDetailPage() {
  const { user, loading: authLoading, signOut, session } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id as string | undefined

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Project>>({})
  const [isUpdating, setIsUpdating] = useState(false)

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
  } = !projectId || !user?.id || !session?.access_token ? {
    ideas: [],
    loading: false,
    error: null,
    generating: false,
    createError: null,
    deleteError: null,
    generateError: null,
    fetchIdeas: async () => {},
    createIdea: async () => {},
    deleteIdea: async () => {},
    generateIdeas: async () => {},
  } : useIdeas({
    projectId,
    userId: user.id,
    accessToken: session.access_token,
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

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
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

  return (
    <div className="min-h-screen bg-white">
      <ProjectNavbar
        onBack={() => router.push("/dashboard")}
        onLogout={signOut}
      />
      <main className="max-w-2xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-24 text-gray-400 text-lg">Loading project...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-red-400 text-lg">
            <span className="text-2xl mb-4">❗</span>
            {error}
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 text-sm text-gray-500 underline hover:text-black"
            >
              Go back to dashboard
            </button>
          </div>
        ) : project ? (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                  <p className="mt-2 text-gray-600">{project.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={openEditModal}>
                    Edit Project
                  </Button>
                  <Button 
                    onClick={handleDeleteProject}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Project
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Niche:</span>
                  <span className="ml-2 text-gray-900">{project.niche || "Not set"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Platform:</span>
                  <span className="ml-2 text-gray-900 capitalize">{project.platform}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tone:</span>
                  <span className="ml-2 text-gray-900">{project.tone || "Not set"}</span>
                </div>
              </div>
            </div>

            {/* Main Action Area */}
            <div className="mb-12">
              <Button onClick={generateIdeas} disabled={generating}>
                {generating ? "Generating..." : "Generate Ideas"}
              </Button>
              {generateError && (
                <div className="mt-4 text-red-500 text-sm">{generateError}</div>
              )}
              {deleteError && (
                <div className="mt-4 text-red-500 text-sm">{deleteError}</div>
              )}
              {createError && (
                <div className="mt-4 text-red-500 text-sm">{createError}</div>
              )}
              {ideasError && (
                <div className="mt-4 text-red-500 text-sm">{ideasError}</div>
              )}
            </div>

            {/* Manual Idea Input */}
            <IdeaInputForm onSubmit={createIdea} disabled={generating} />

            {/* Ideas List */}
            {ideasLoading ? (
              <div className="mb-12 text-gray-400">Loading ideas...</div>
            ) : (
              <GeneratedIdeasList 
                ideas={ideas} 
                onDelete={handleDeleteIdea} 
                projectId={projectId!}
              />
            )}
          </>
        ) : null}
      </main>

      {/* Edit Project Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <Input
              name="name"
              value={editForm.name || ""}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <Input
              name="description"
              value={editForm.description || ""}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Niche</label>
            <Input
              name="niche"
              value={editForm.niche || ""}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Platform</label>
            <Select
              value={editForm.platform || ""}
              onValueChange={(value) => setEditForm(prev => ({ ...prev, platform: value as Project["platform"] }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tone</label>
            <Input
              name="tone"
              value={editForm.tone || ""}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setIsEditModalOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
} 