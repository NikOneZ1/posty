"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getProjectById } from "@/api/projects"
import { Project } from "@/types/Project"
import { Idea } from "@/types/Idea"
import { Button } from "@/components/ui/Button"
import { ProjectNavbar } from "@/components/projects/ProjectNavbar"
import { ProjectHeader } from "@/components/projects/ProjectHeader"
import { GeneratedIdeasList } from "@/components/projects/GeneratedIdeasList"
import { IdeaInputForm } from "@/components/projects/IdeaInputForm"
import { useIdeas } from "@/hooks/useIdeas"

export default function ProjectDetailPage() {
  const { user, loading: authLoading, signOut, session } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id as string | undefined

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
    projectId: projectId!,
    userId: user?.id!,
    accessToken: session?.access_token!,
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
            <ProjectHeader project={project} />
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
            {/* Tab Navigation Placeholder */}
            <div className="border-b border-gray-100 h-12 flex items-end mb-2">
              {/* Tabs will go here in the future */}
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
} 