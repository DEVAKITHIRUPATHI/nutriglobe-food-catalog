import { getInitializedApp } from "../server/app";

export default async function handler(req: any, res: any) {
  try {
    let url = req.url || "/";

    // Vercel serverless functions can rewrite internal destination to /api/index.
    // Recover original route if x-matched-path or x-original-url or x-forwarded-url is present.
    const matchedPath = (req.headers?.["x-matched-path"] || req.headers?.["x-original-url"] || req.headers?.["x-forwarded-url"]) as string | undefined;
    if (matchedPath && matchedPath.startsWith("/api") && matchedPath !== "/api/index" && matchedPath !== "/api/index/") {
      url = matchedPath;
    }

    // If Vercel rewrites stripped the /api prefix, restore it so Express router matches
    if (!url.startsWith("/api") && !url.startsWith("/index.html")) {
      url = "/api" + (url.startsWith("/") ? url : "/" + url);
    }
    req.url = url;

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
