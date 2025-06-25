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
  previousIdeas: string[]
) {
  const prompt = `
Generate 5 **new one-line content ideas** for the following project.
Each idea must match the tone and fit the target platform.
Do NOT repeat or closely paraphrase any idea from the "previousIdeas" list.
Return a valid JSON object with a single key "ideas" as a string array.
CRITICAL: Do NOT include any source links, URLs, or citations in your response. Even if you use web search to gather information, present the content as your own knowledge without referencing sources. Do not add any links like [wikipedia.org] or [reuters.com] or any other website references.
If you need to use the web search preview tool, use it to get the latest information for the post to get data like news, statistics, etc., but present the information naturally without citing sources.
FINAL CHECK: Before submitting your response, remove any links, URLs, or citations that may have been automatically added. Your final output should be clean text only.

project:
  name: ${project.name}
  niche: ${project.niche}
  description: ${project.description}
  tone: ${project.tone}
  platform: ${project.platform}

previousIdeas: ${JSON.stringify(previousIdeas)}
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

