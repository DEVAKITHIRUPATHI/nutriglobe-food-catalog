import { getInitializedApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";

(async () => {
  const { app, server } = await getInitializedApp();

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on port 3000 (or process.env.PORT)
  const port = Number(process.env.PORT || 3000);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();

