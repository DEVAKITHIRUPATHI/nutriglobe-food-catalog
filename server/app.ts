import express, { type Express } from "express";
import { registerRoutes } from "./routes";
import { securityHeadersMiddleware, rateLimiterMiddleware, safeErrorHandler } from "./middleware/security";
import { log } from "./logger";
import type { Server } from "http";

export function createBaseApp(): Express {
  const app = express();

  // Apply Enterprise Security Protection Headers & Anti-Bot Shield
  app.use(securityHeadersMiddleware);

  // Apply API & AI Endpoint Rate Limiter
  app.use(rateLimiterMiddleware);

  // Security guard: In production, explicitly block browser requests for server build files, source code, and source maps
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      const rawUrl = (req.path || req.url || "").split("?")[0].toLowerCase();
      if (
        rawUrl.startsWith("/dist") ||
        rawUrl.startsWith("/server") ||
        (rawUrl.startsWith("/api/") && (rawUrl.endsWith(".ts") || rawUrl.endsWith(".js") || rawUrl.endsWith(".tsx"))) ||
        rawUrl.endsWith(".cjs") ||
        rawUrl.endsWith(".mjs") ||
        rawUrl.endsWith(".map") ||
        rawUrl.endsWith(".ts") ||
        rawUrl.endsWith(".tsx")
      ) {
        return res.status(404).type("text/plain").send("Not Found");
      }
      next();
    });
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  return app;
}

let appInstance: Express | null = null;
let serverInstance: Server | null = null;
let initPromise: Promise<{ app: Express; server: Server }> | null = null;

export async function getInitializedApp(): Promise<{ app: Express; server: Server }> {
  if (appInstance && serverInstance) {
    return { app: appInstance, server: serverInstance };
  }
  if (!initPromise) {
    initPromise = (async () => {
      const app = createBaseApp();
      const server = await registerRoutes(app);
      app.use(safeErrorHandler);
      appInstance = app;
      serverInstance = server;
      return { app, server };
    })();
  }
  return initPromise;
}
