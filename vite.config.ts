import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client", "src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },
  root: path.resolve(process.cwd(), "client"),
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
  build: {
    outDir: path.resolve(process.cwd(), "dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("shared/mockData") || id.includes("shared\\mockData")) {
            return "data-foods-catalog";
          }
          if (
            id.includes("shared/expandedFoodItems") ||
            id.includes("shared\\expandedFoodItems") ||
            id.includes("shared/largeScaleFoodCatalog") ||
            id.includes("shared\\largeScaleFoodCatalog") ||
            id.includes("shared/globalFoodDatabaseSeed") ||
            id.includes("shared\\globalFoodDatabaseSeed") ||
            id.includes("shared/additionalFoodItems") ||
            id.includes("shared\\additionalFoodItems")
          ) {
            return "data-foods-extended";
          }
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("html-to-image")) {
              return "vendor-export";
            }
            if (id.includes("recharts") || id.includes("d3")) {
              return "vendor-charts";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
          }
        },
      },
    },
  },
});
