import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes for Vercel Serverless Functions
let serverPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  try {
    if (!serverPromise) {
      serverPromise = registerRoutes(app);
    }
    await serverPromise;

    // Direct fast-path for API health / status check
    const rawPath = (req.url || "").split("?")[0];
    if (rawPath === "/api/status" || rawPath === "/status") {
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ status: "online" });
    }

    // Normalize URL for Express routing if Vercel strips or rewrites /api
    let url = req.url || "/";
    const matchedPath = (req.headers?.["x-matched-path"] || req.headers?.["x-original-url"] || req.headers?.["x-forwarded-url"]) as string | undefined;
    if (matchedPath && (matchedPath.startsWith("/api") || matchedPath.startsWith("/health"))) {
      const qIndex = url.indexOf("?");
      url = matchedPath + (qIndex !== -1 ? url.slice(qIndex) : "");
    }
    if (!url.startsWith("/api") && !url.startsWith("/health")) {
      url = "/api" + (url.startsWith("/") ? url : "/" + url);
    }
    req.url = url;

    return app(req, res);
  } catch (err: any) {
    console.error("[Vercel Serverless Error]:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: err?.message || "Server initialization failed",
      });
    }
  }
}
