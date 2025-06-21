import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function rewriteContent(
  text: string,
  action:
    | "shorten"
    | "expand"
    | "fix"
    | "professional"
    | "empathetic"
    | "casual"
    | "neutral"
    | "educational",
) {
  let prompt: string;
  switch (action) {
    case "shorten":
      prompt = `Shorten the following text while keeping its original meaning:\n\n${text}`;
      break;
    case "expand":
      prompt = `Expand the following text with more detail while keeping its original meaning:\n\n${text}`;
      break;
    case "fix":
      prompt = `Fix any grammar or spelling mistakes in the following text without changing its meaning:\n\n${text}`;
      break;
    case "professional":
      prompt = `Rewrite the following text in a professional tone:\n\n${text}`;
      break;
    case "empathetic":
      prompt = `Rewrite the following text in an empathetic tone:\n\n${text}`;
      break;
    case "casual":
      prompt = `Rewrite the following text in a casual tone:\n\n${text}`;
      break;
    case "neutral":
      prompt = `Rewrite the following text in a neutral tone:\n\n${text}`;
      break;
    case "educational":
      prompt = `Rewrite the following text in an educational tone:\n\n${text}`;
      break;
    default:
      throw new Error("Unsupported action");
  }

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    instructions: "You rewrite content based on a provided action.",
    input: prompt,
  });

  return response.output_text.trim();
}
