import OpenAI from 'openai';
import { Project } from '@/types/Project';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateImageFromIdea(
  content_text: string,
  project: Project,
): Promise<Buffer> {
  const prompt = `Create an illustrative image for the following social media post. Use the project context to understand the style, tone, and visual direction, but focus the image on the content itself, not the project details. Avoid using text in the image unless it's absolutely essential for the illustration.

Project context (for style reference only):
- Project name: ${project.name}
- Niche: ${project.niche}
- Description: ${project.description}
- Tone: ${project.tone}
- Platform: ${project.platform}

Create an image that illustrates: ${content_text}

Important: Use minimal or no text in the image. Only include text if it's crucial for understanding the visual concept.`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    tools: [{
      type: "image_generation",
      size: "1024x1024",
      quality: "medium",
    }],
  });

  // Save the image to a file
  const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

  if (imageData.length > 0 && imageData[0]) {
    const imageBase64 = imageData[0];
    return Buffer.from(imageBase64, "base64");
  }

  throw new Error("Failed to generate image");
}
