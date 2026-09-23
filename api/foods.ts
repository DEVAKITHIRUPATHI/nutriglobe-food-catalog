import { storage } from "../server/storage";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    const category = req.query?.category as string | undefined;
    const query = req.query?.query as string | undefined;

    if (query) {
      const searchResults = await storage.searchFoodItems(query, category);
      return res.status(200).json(searchResults);
    }

    if (category) {
      const categoryFoods = await storage.getFoodItemsByCategory(category);
      return res.status(200).json(categoryFoods);
    }

    const foods = await storage.getAllFoodItems();
    return res.status(200).json(foods);
  } catch (error: any) {
    console.error("[api/foods error]:", error);
    return res.status(500).json({ error: "Failed to retrieve foods", message: error.message });
  }
}
