import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import { generateIdeas } from "@/lib/ai/generateIdeas"
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { project_id } = req.body
  if (!project_id) {
    return res.status(400).json({ error: "Missing project_id" })
  }

  // Auth: get user from Bearer token
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" })
  }
  const token = authHeader.replace("Bearer ", "")
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token)
  if (userError || !user) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", project_id)
    .eq("user_id", user.id)
    .single()
  if (projectError || !project) {
    return res.status(404).json({ error: "Project not found" })
  }

  const { data: ideas, error: ideasError } = await supabase
    .from("ideas")
    .select("idea_text, status")
    .eq("project_id", project_id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)
  if (ideasError) {
    return res.status(500).json({ error: "Failed to fetch ideas from database" })
  }

  let ideasGenerated: string[] = []
  try {
    ideasGenerated = await generateIdeas(project, ideas)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Failed to generate ideas from OpenAI" })
  }

  if (ideasGenerated.length < 1) {
    return res.status(500).json({ error: "OpenAI did not return valid ideas" })
  }

  // Save ideas to DB
  const ideasToInsert = ideasGenerated.map((idea_text: string) => ({
    id: uuidv4(),
    user_id: user.id,
    project_id,
    idea_text,
  }))
  const { data: insertedIdeas, error: insertError } = await supabase
    .from("ideas")
    .insert(ideasToInsert)
    .select()
  if (insertError) {
    return res.status(500).json({ error: "Failed to save ideas to database" })
  }

  // Return ideas
  return res.status(200).json({
    ideas: insertedIdeas.map((idea: { id: string; idea_text: string; status: string; image_url: string | null }) => ({
      id: idea.id,
      idea_text: idea.idea_text,
      status: idea.status,
      image_url: idea.image_url,
      created_at: new Date().toISOString(),
    })),
  })
}
