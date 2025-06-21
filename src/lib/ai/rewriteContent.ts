import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type RewriteAction = 'shorten' | 'expand' | 'tone';
export type RewriteTone =
  | 'professional'
  | 'empathetic'
  | 'casual'
  | 'neutral'
  | 'educational';

export async function rewriteContent(
  text: string,
  action: RewriteAction,
  tone?: RewriteTone
) {
  let prompt: string;
  switch (action) {
    case 'shorten':
      prompt = `Shorten the following text while keeping its original meaning:\n\n${text}`;
      break;
    case 'expand':
      prompt = `Expand the following text with more detail while keeping its original meaning:\n\n${text}`;
      break;
    case 'tone':
      prompt = `Rewrite the following text in a ${tone} tone while keeping its original meaning:\n\n${text}`;
      break;
    default:
      throw new Error('Unsupported action');
  }

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    instructions: "You rewrite content based on a provided action.",
    input: prompt,
  });

  return response.output_text.trim();
}
