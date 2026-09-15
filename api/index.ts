import { getInitializedApp } from "../server/app";

export default async function handler(req: any, res: any) {
  try {
    let url = req.url || "/";
    // If Vercel rewrites stripped the /api prefix, restore it so Express router matches
    if (!url.startsWith("/api") && !url.startsWith("/index.html")) {
      url = "/api" + (url.startsWith("/") ? url : "/" + url);
      req.url = url;
    }
    const { app } = await getInitializedApp();
    return app(req, res);
  } catch (err: any) {
    console.error("[Vercel Handler Error]:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: err?.message || "Server initialization failed"
      });
    }
  }
}
