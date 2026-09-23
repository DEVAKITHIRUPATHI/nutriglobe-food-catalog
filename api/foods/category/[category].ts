import { storage } from "../../../server/storage";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    const category = req.query?.category as string | undefined;
    if (!category) {
      return res.status(400).json({ error: "Category parameter is required" });
    }

    const foods = await storage.getFoodItemsByCategory(category);
    return res.status(200).json(foods);
  } catch (error: any) {
    console.error("[api/foods/category/[category] error]:", error);
    return res.status(500).json({ error: "Failed to retrieve foods by category", message: error.message });
  }
}
