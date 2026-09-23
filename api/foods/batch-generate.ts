import { storage } from "../../server/storage";
import { generateGeminiFoodItem, generateCompleteFoodItem } from "../../server/utils/geminiHelper";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { items, languages } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array is required" });
  }

  try {
    const results = [];
    const targetLanguages = languages || ["en", "es", "fr", "hi", "ta"];

    for (const item of items) {
      try {
        let generatedItem;
        if (process.env.GEMINI_API_KEY) {
          generatedItem = await generateGeminiFoodItem(
            item.foodName,
            item.description,
            item.categories,
            item.imagePath,
            targetLanguages
          );
        } else {
          generatedItem = await generateCompleteFoodItem(
            item.foodName,
            item.description,
            item.categories,
            item.imagePath,
            targetLanguages
          );
        }
        const saved = await storage.createFoodItem(generatedItem);
        results.push({ success: true, item: saved });
      } catch (err: any) {
        results.push({ success: false, foodName: item.foodName, error: err.message });
      }
    }

    return res.status(200).json({ results });
  } catch (error: any) {
    console.error("[api/foods/batch-generate error]:", error);
    return res.status(500).json({ error: "Batch generation failed", message: error.message });
  }
}
