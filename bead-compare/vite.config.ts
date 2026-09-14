import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA. `base` is relative so the built folder works from any path
// (Vercel root, a sub-folder, or file:// for a quick look).
// `publicDir` is the fixtures folder so "Load demo passage" can fetch
// ./ruth-1-1-5/v1|v2/{audio.wav,tape.json,meta.json}.
export default defineConfig({
  plugins: [react()],
  base: "./",
  publicDir: "fixtures",
  build: { outDir: "dist", sourcemap: false },
});
