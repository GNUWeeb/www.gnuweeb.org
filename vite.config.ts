import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    proxy: {
      "/tgd-proxy": {
        target: "https://tgd.gnuweeb.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tgd-proxy/, "")
      }
    }
  }
});
