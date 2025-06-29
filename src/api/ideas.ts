import { Idea } from "@/types/Idea"
import { supabase } from "@/lib/supabaseClient"

export async function getIdeasForProject(project_id: string, user_id: string): Promise<Idea[]> {
  const { data, error } = await supabase
    .from("ideas")
    .select("id, idea_text, status, image_url")
    .eq("project_id", project_id)
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Idea[]
}

export async function deleteIdea(idea_id: string, user_id: string): Promise<void> {
  await supabase
    .from("ideas")
    .update({ status: 'archived' })
    .eq("id", idea_id)
    .eq("user_id", user_id)
}

export async function generateIdeas(project_id: string, access_token: string): Promise<Idea[]> {
  const res = await fetch("/api/ideas/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ project_id }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Failed to generate ideas")
  return data.ideas as Idea[]
}

export async function createIdea(project_id: string, idea_text: string, access_token: string): Promise<Idea> {
  const res = await fetch("/api/ideas/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ project_id, idea_text }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Failed to create idea")
  return data.idea as Idea
} 