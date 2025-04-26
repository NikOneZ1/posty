import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"
import type { ChatCompletionCreateParamsBase, ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { OpenAI } from "openai"
import { v4 as uuidv4 } from "uuid"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

  // Build GPT prompt
  const prompt = `You are a creative social media strategist.\n\nTask:\nGenerate exactly 5 short and punchy content ideas for a project.\n\nProject Niche: ${project.niche || "-"}\nTone: ${project.tone || "-"}\nDescription: ${project.description || "-"}\n\nReturn ideas as simple list:\n1. Idea one\n2. Idea two\n3. Idea three\n4. Idea four\n5. Idea five\n`;

  // Call OpenAI GPT-4o
  let gptResponse
  try {
    console.log(prompt)
    gptResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a creative social media strategist." },
        { role: "user", content: prompt },
      ] as ChatCompletionMessageParam[],
      temperature: 0.7,
      max_tokens: 400,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Failed to generate ideas from OpenAI" })
  }

  // Parse GPT response
  const text = gptResponse.choices[0]?.message?.content || ""
  console.log(text)
  const ideas = text
    .split(/\n+/)
    .map((line: string) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((line: string) => line.length > 0 && line.length < 200)
    .slice(0, 5)

  console.log(ideas)

  if (ideas.length < 1) {
    return res.status(500).json({ error: "OpenAI did not return valid ideas" })
  }

  // Save ideas to DB
  const ideasToInsert = ideas.map((idea_text: string) => ({
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
    ideas: insertedIdeas.map((idea: { id: string; idea_text: string }) => ({ id: idea.id, idea_text: idea.idea_text })),
  })
} 