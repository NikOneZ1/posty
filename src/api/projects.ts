import { supabase } from "@/lib/supabaseClient"
import { Project } from "@/types/Project"

export async function getProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

export async function createProject(userId: string, form: Omit<Project, "id" | "created_at" | "user_id">): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert([{ ...form, user_id: userId }])
    .select()
  if (error) throw error
  return data![0]
}

export async function getProjectById(id: string, userId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single()
  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data || null
}

export async function updateProject(
  id: string,
  userId: string,
  form: Partial<Omit<Project, "id" | "created_at" | "user_id">>
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update(form)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single()
  if (error) throw error
  return data
} 