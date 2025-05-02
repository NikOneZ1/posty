import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { idea_text, project_id } = req.body
  if (!idea_text || !project_id) {
    return res.status(400).json({ error: "Missing required fields" })
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

  // Verify project exists and belongs to user
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", project_id)
    .eq("user_id", user.id)
    .single()
  if (projectError || !project) {
    return res.status(404).json({ error: "Project not found" })
  }

  // Create idea
  const idea = {
    id: uuidv4(),
    user_id: user.id,
    project_id,
    idea_text,
  }
  const { data: insertedIdea, error: insertError } = await supabase
    .from("ideas")
    .insert(idea)
    .select()
    .single()
  if (insertError) {
    return res.status(500).json({ error: "Failed to create idea" })
  }

  return res.status(200).json({ idea: insertedIdea })
} 