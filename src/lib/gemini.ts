import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

function extractJson(text: string) {
  // Remove common code fences if present
  const cleaned = text
    .replace(/```json/gi, "```")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function generateIdeaWithGemini(topic: string) {
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Return JSON only with keys: hook, title, thumbnail.
Topic: "${topic}"

Rules:
- Hook: one strong opener line
- Title: clickable YouTube title
- Thumbnail: 2-4 words, punchy
No extra commentary.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJson(text);

    // Extra validation so we don't save broken data
    if (
      !parsed ||
      typeof parsed.hook !== "string" ||
      typeof parsed.title !== "string" ||
      typeof parsed.thumbnail !== "string"
    ) {
      return null;
    }

    return {
      hook: parsed.hook.trim(),
      title: parsed.title.trim(),
      thumbnail: parsed.thumbnail.trim(),
    };
  } catch {
    return null; // fallback to local generator
  }
}
