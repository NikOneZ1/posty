import { IdeaLight } from "@/types/Idea";
import { Project } from "@/types/Project";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ideaSchema = {
  type: "object",
  properties: {
    ideas: {
      type: "array",
      items: {
        type: "string"
      }
    }
  },
  additionalProperties: false,
  required: ["ideas"]
} as const;

export async function generateIdeas(
  project: Project,
  previousIdeas: IdeaLight[]
) {
  const prompt = `
Generate 5 new one-line content ideas for this project. Each idea must match the tone and fit the target platform.
Do NOT repeat or closely paraphrase any idea from previousIdeas. Consider idea status - archived ideas are not relevant.
Return valid JSON: {"ideas": ["idea1", "idea2", ...]}
CRITICAL: No source links, URLs, or citations. Present information as your own knowledge without referencing sources.

Project:
  name (social media page name, could be a brand name, company name, person name if it's a personal account): ${project.name}
  niche: ${project.niche}
  description: ${project.description}
  tone: ${project.tone}
  platform: ${project.platform}

Previous ideas: ${JSON.stringify(previousIdeas)}
`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    instructions: "You are a creative strategist generating fresh one-line content ideas tailored to the provided project context.",
    tools: [{
      type: "web_search_preview",
      search_context_size: "low",
    }],
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        schema: ideaSchema,
        name: "ideas"
      }
    }
  });

  return JSON.parse(response.output_text).ideas as string[];
}

