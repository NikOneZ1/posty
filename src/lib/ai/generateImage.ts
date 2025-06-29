import OpenAI from 'openai';
import { Project } from '@/types/Project';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateImageFromIdea(
  idea: string,
  project: Project,
): Promise<Buffer> {
  const prompt = `Create an illustrative image for the following content idea.\n\nProject name: ${project.name}\nNiche: ${project.niche}\nDescription: ${project.description}\nTone: ${project.tone}\nPlatform: ${project.platform}\n\nIdea: ${idea}`;

  const response = await openai.images.generate({
    model: 'gpt-image-1',
    prompt,
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json',
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('Failed to generate image');
  }

  return Buffer.from(b64, 'base64');
}
