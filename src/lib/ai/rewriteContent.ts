import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function rewriteContent(text: string, action: "shorten") {
  let prompt: string;
  switch (action) {
    case "shorten":
      prompt = `Shorten the following text while keeping its original meaning:\n\n${text}`;
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
