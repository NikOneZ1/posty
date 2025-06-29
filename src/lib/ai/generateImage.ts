import OpenAI from 'openai';
import { Project } from '@/types/Project';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateImageFromIdea(
  idea: string,
  content: string,
  project: Project,
) {
  const prompt = `Create an image for the following social media post.\n\nProject Information:\n- Name: ${project.name}\n- Niche: ${project.niche}\n- Description: ${project.description}\n- Tone: ${project.tone}\n- Platform: ${project.platform}\n\nIdea: ${idea}\nContent: ${content}`;

  const response = await openai.images.generate({
    model: 'gpt-image-1',
    prompt,
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json',
  });

  return response.data[0].b64_json as string;
}
