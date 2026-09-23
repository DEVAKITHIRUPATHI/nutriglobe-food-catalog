import { storage } from "../../server/storage";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    const popularFoods = await storage.getPopularFoodItems();
    return res.status(200).json(popularFoods);
  } catch (error: any) {
    console.error("[api/foods/popular error]:", error);
    return res.status(500).json({ error: "Failed to retrieve popular foods", message: error.message });
  }
}
