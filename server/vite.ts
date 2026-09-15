import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";

import { log } from "./logger";
export { log };

const viteLogger = createLogger();

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const rawUrl = (req.originalUrl || req.url || "").split("?")[0].toLowerCase();
    if (
      rawUrl.startsWith("/dist") ||
      rawUrl.startsWith("/server") ||
      rawUrl.endsWith(".cjs") ||
      rawUrl.endsWith(".mjs") ||
      rawUrl.endsWith(".map") ||
      rawUrl.endsWith(".ts") ||
      rawUrl.endsWith(".tsx")
    ) {
      return res.status(404).type("text/plain").send("Not Found");
    }
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        process.cwd(),
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${Math.random().toString(36).substring(2)}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPublicPath = path.resolve(process.cwd(), "dist", "public");
  const distRootPath = path.resolve(process.cwd(), "dist");
  const distPath = fs.existsSync(distPublicPath) && fs.existsSync(path.resolve(distPublicPath, "index.html"))
    ? distPublicPath
    : distRootPath;

  if (!fs.existsSync(distPath) || !fs.existsSync(path.resolve(distPath, "index.html"))) {
    throw new Error(
      `Could not find index.html in build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Security guard: Explicitly block browser requests for server build files, source code, and source maps
  app.use((req, res, next) => {
    const rawUrl = (req.url || "").split("?")[0].toLowerCase();
    if (
      rawUrl.startsWith("/dist") ||
      rawUrl.startsWith("/server") ||
      rawUrl.startsWith("/api/") && (rawUrl.endsWith(".ts") || rawUrl.endsWith(".js") || rawUrl.endsWith(".tsx")) ||
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

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const rawUrl = (req.originalUrl || req.url || "").split("?")[0].toLowerCase();
    if (
      rawUrl.startsWith("/dist") ||
      rawUrl.startsWith("/server") ||
      rawUrl.endsWith(".cjs") ||
      rawUrl.endsWith(".mjs") ||
      rawUrl.endsWith(".map") ||
      rawUrl.endsWith(".ts") ||
      rawUrl.endsWith(".tsx")
    ) {
      return res.status(404).type("text/plain").send("Not Found");
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
