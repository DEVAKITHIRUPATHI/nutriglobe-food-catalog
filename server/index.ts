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

  // Port 3000 is strictly required by the reverse proxy infrastructure
  const PORT = 3000;
  server.listen({
    port: PORT,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${PORT}`);
  });
})();

