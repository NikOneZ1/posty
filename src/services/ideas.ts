import { Idea } from "@/types/Idea"
import { fetchApi, getSupabaseClient } from "./api"

export interface CreateIdeaParams {
  projectId: string
  ideaText: string
  accessToken: string
}

export interface DeleteIdeaParams {
  ideaId: string
  userId: string
}

export interface GenerateIdeasParams {
  projectId: string
  accessToken: string
}

export class IdeasService {
  static async getForProject(projectId: string, userId: string): Promise<Idea[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("ideas")
      .select("id, idea_text, status, image_url")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Idea[]
  }

  static async create({ projectId, ideaText, accessToken }: CreateIdeaParams): Promise<{ idea: Idea }> {
    return fetchApi<{ idea: Idea }>("/api/ideas/create", {
      method: "POST",
      body: { project_id: projectId, idea_text: ideaText },
      accessToken,
    })
  }

  static async delete({ ideaId, userId }: DeleteIdeaParams): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from("ideas")
      .update({ status: "archived" })
      .eq("id", ideaId)
      .eq("user_id", userId)

    if (error) throw error
  }

  static async generate({ projectId, accessToken }: GenerateIdeasParams): Promise<Idea[]> {
    const data = await fetchApi<{ ideas: Idea[] }>("/api/ideas/generate", {
      method: "POST",
      body: { project_id: projectId },
      accessToken,
    })
    return data.ideas
  }
} 