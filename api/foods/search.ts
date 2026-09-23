import { storage } from "../../server/storage";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    const query = (req.query?.query || req.query?.q || "") as string;
    if (!query) {
      return res.status(200).json([]);
    }
    const results = await storage.searchFoodItems(query);
    return res.status(200).json(results);
  } catch (error: any) {
    console.error("[api/foods/search error]:", error);
    return res.status(500).json({ error: "Failed to search foods", message: error.message });
  }
}
