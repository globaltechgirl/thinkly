import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "/", 
  plugins: [react(), svgr()],
  server: {
    host: true,
    port: 0,
    strictPort: false,
  },
  preview: {
    host: true,
    port: 0,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});