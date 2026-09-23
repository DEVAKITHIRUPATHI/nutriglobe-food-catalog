import { askGeminiNutritionAssistant } from "../../server/utils/geminiHelper";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { prompt, lang } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    if (process.env.GEMINI_API_KEY) {
      const answer = await askGeminiNutritionAssistant(prompt, lang || "en");
      return res.status(200).json({ answer });
    } else {
      return res.status(200).json({
        answer: "Gemini API key is not yet provided. Configure GEMINI_API_KEY in Settings > Secrets to enable live AI nutrition guidance."
      });
    }
  } catch (error: any) {
    console.error("[api/ai/nutrition-assistant error]:", error);
    return res.status(500).json({ error: error.message || "Failed to query AI assistant" });
  }
}
