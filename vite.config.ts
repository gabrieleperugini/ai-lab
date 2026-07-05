import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base path for GitHub Pages: https://<user>.github.io/ai-lab/
// If you rename the repository, change VITE_BASE (or this default) to match:
//   VITE_BASE=/my-new-name/ npm run build
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: process.env.VITE_BASE ?? (mode === "development" ? "/" : "/ai-lab/"),
  build: {
    chunkSizeWarningLimit: 3000
  }
}));
