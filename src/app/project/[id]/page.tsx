"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getProjectById } from "@/api/projects"
import { getIdeasForProject, generateIdeas } from "@/api/ideas"
import { Project } from "@/types/Project"
import { Idea } from "@/types/Idea"
import { Button } from "@/components/ui/Button"
import { ProjectNavbar } from "@/components/projects/ProjectNavbar"
import { ProjectHeader } from "@/components/projects/ProjectHeader"
import { GeneratedIdeasList } from "@/components/projects/GeneratedIdeasList"

export default function ProjectDetailPage() {
  const { user, loading: authLoading, signOut, session } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id as string | undefined

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [ideasLoading, setIdeasLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState("")

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

  const fetchIdeas = async () => {
    setIdeasLoading(true)
    try {
      const data = await getIdeasForProject(projectId!, user!.id)
      setIdeas(data)
    } catch {
      setIdeas([])
    } finally {
      setIdeasLoading(false)
    }
  }

  const handleGenerateIdeas = async () => {
    if (!projectId || !session) return
    setGenerating(true)
    setGenerateError("")
    try {
      const newIdeas = await generateIdeas(projectId, session.access_token)
      setIdeas((prev) => [...newIdeas, ...prev])
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate ideas")
    } finally {
      setGenerating(false)
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
              <Button onClick={handleGenerateIdeas} disabled={generating}>
                {generating ? "Generating..." : "Generate Ideas"}
              </Button>
              {generateError && (
                <div className="mt-4 text-red-500 text-sm">{generateError}</div>
              )}
            </div>
            {ideasLoading ? (
              <div className="mb-12 text-gray-400">Loading ideas...</div>
            ) : (
              <GeneratedIdeasList ideas={ideas} />
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