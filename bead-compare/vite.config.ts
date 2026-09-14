import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA. `base` is relative so the built folder works from any path
// (Vercel root, a sub-folder, or file:// for a quick look).
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "dist", sourcemap: false },
});
