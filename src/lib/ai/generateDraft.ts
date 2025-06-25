import OpenAI from "openai";
import { Project } from "@/types/Project";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getPlatformGuidance(platform: string): string {
  switch (platform) {
    case 'twitter':
      return `Create an engaging Twitter thread that naturally flows from one point to the next. Start with a hook that grabs attention, then share your insights in a conversational way. End with something that encourages engagement. Keep it casual and easy to read.`;
    case 'linkedin':
      return `Write a professional but engaging LinkedIn post. Share valuable insights that your audience can learn from. Make it personal and authentic while maintaining a business-appropriate tone.`;
    case 'telegram':
      return `Create a friendly, conversational Telegram post. Share interesting insights in a casual way that feels like you're talking directly to your audience.`;
    default:
      return '';
  }
}

export async function generateDraftFromIdea(
  idea: string,
  project: Project
) {
  const platformGuidance = getPlatformGuidance(project.platform);
  
  const prompt = `
You are a professional content writer creating a ${project.platform} post.

Project Info:
- Name: ${project.name}
- Niche: ${project.niche}
- Description: ${project.description}
- Tone: ${project.tone}

Idea: "${idea}"

${platformGuidance}

Important: Write the post in the same language as the idea provided above. If the idea is in English, write in English. If it's in Spanish, write in Spanish, and so on.

Generate a single draft post based on this idea. Match the tone and platform style. The output should be ready to post as-is. Do not explain or wrap it in markdown or JSON — just return the final text.

CRITICAL: Do NOT include any source links, URLs, or citations in your response. Even if you use web search to gather information, present the content as your own knowledge without referencing sources. Do not add any links like [wikipedia.org] or [reuters.com] or any other website references.

If you need to use the web search preview tool, use it to get the latest information for the post to get data like news, statistics, etc., but present the information naturally without citing sources.

FINAL CHECK: Before submitting your response, remove any links, URLs, or citations that may have been automatically added. Your final output should be clean text only.
`;

  const response = await openai.responses.create({
    model: "gpt-4.1", 
    tools: [{
      type: "web_search_preview",
      search_context_size: "low",
    }],
    instructions: "You generate platform-native content based on a one-line idea and project context. Never include source links or citations in your output.",
    input: prompt,
  });

  return response.output_text.trim();
}
