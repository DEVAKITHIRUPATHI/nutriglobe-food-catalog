import { storage } from "../../server/storage";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    const rawId = (req.query?.id || req.params?.id) as string | undefined;
    if (!rawId) {
      return res.status(400).json({ error: "Food ID is required" });
    }

    const food = await storage.getFoodItemById(String(rawId));
    if (!food) {
      return res.status(404).json({ error: "Food item not found" });
    }

    return res.status(200).json(food);
  } catch (error: any) {
    console.error("[api/foods/[id] error]:", error);
    return res.status(500).json({ error: "Failed to retrieve food", message: error.message });
  }
}
