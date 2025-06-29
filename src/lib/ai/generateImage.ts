import OpenAI from 'openai';
import { Project } from '@/types/Project';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Params {
  project: Project;
  ideaText: string;
}

export async function generateIdeaImage({ project, ideaText }: Params) {
  const prompt = `Project name: ${project.name}
Niche: ${project.niche}
Description: ${project.description}
Tone: ${project.tone}
Platform: ${project.platform}

Idea: ${ideaText}

Create an illustrative image representing this idea for the described project.`;

  const response = await openai.images.generate({
    model: 'gpt-image-1',
    prompt,
  });

  return response.data[0]?.url as string | undefined;
}
