import { storage } from "../../server/storage";
import { generateGeminiFoodItem, generateCompleteFoodItem } from "../../server/utils/geminiHelper";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { foodName, description, categories, imagePath, languages } = req.body || {};

  if (!foodName || !description || !categories) {
    return res.status(400).json({ error: "Missing required fields: foodName, description, categories" });
  }

  try {
    const targetLanguages = languages || ["en", "es", "fr", "hi", "ta"];
    let newFoodItem;

    if (process.env.GEMINI_API_KEY) {
      newFoodItem = await generateGeminiFoodItem(
        foodName,
        description,
        categories,
        imagePath,
        targetLanguages
      );
    } else {
      newFoodItem = await generateCompleteFoodItem(
        foodName,
        description,
        categories,
        imagePath,
        targetLanguages
      );
    }

    const savedItem = await storage.createFoodItem(newFoodItem);
    return res.status(201).json(savedItem);
  } catch (error: any) {
    console.error("[api/foods/generate error]:", error);
    return res.status(500).json({ error: "Failed to generate food item", message: error.message });
  }
}
