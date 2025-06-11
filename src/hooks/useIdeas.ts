import { useState, useCallback } from "react"
import { Idea } from "@/types/Idea"
import { IdeasService } from "@/services/ideas"
import { ApiError } from "@/services/api"

interface UseIdeasOptions {
  projectId: string
  userId: string
  accessToken: string
  enabled?: boolean
}

interface UseIdeasReturn {
  ideas: Idea[]
  loading: boolean
  error: string | null
  generating: boolean
  createError: string | null
  deleteError: string | null
  generateError: string | null
  fetchIdeas: () => Promise<void>
  createIdea: (ideaText: string) => Promise<void>
  deleteIdea: (ideaId: string) => Promise<void>
  generateIdeas: () => Promise<void>
}

export function useIdeas({ projectId, userId, accessToken, enabled = true }: UseIdeasOptions): UseIdeasReturn {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const fetchIdeas = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const data = await IdeasService.getForProject(projectId, userId)
      setIdeas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch ideas")
      setIdeas([])
    } finally {
      setLoading(false)
    }
  }, [projectId, userId, enabled])

  const createIdea = useCallback(async (ideaText: string) => {
    if (!enabled) return
    setCreateError(null)
    try {
      const { idea: newIdea} = await IdeasService.create({
        projectId,
        ideaText,
        accessToken,
      })
      setIdeas((prev) => [newIdea, ...prev])
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to create idea"
      setCreateError(message)
      throw err
    }
  }, [projectId, accessToken, enabled])

  const deleteIdea = useCallback(async (ideaId: string) => {
    if (!enabled) return
    setDeleteError(null)
    try {
      await IdeasService.delete({ ideaId, userId })
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideaId ? { ...i, status: "archived" } : i
        )
      )
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete idea")
    }
  }, [userId, enabled])

  const generateIdeas = useCallback(async () => {
    if (!enabled) return
    setGenerating(true)
    setGenerateError(null)
    try {
      const newIdeas = await IdeasService.generate({ projectId, accessToken })
      setIdeas((prev) => [...newIdeas, ...prev])
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate ideas")
    } finally {
      setGenerating(false)
    }
  }, [projectId, accessToken, enabled])

  return {
    ideas,
    loading,
    error,
    generating,
    createError,
    deleteError,
    generateError,
    fetchIdeas,
    createIdea,
    deleteIdea,
    generateIdeas,
  }
} 