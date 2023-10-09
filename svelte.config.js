import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";


/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: "dist",
      assets: "dist",
      precompress: false,
      strict: true
    }),
    alias: {
      $lib: "src/lib",
      $types: "src/app.d.ts",
      $components: "src/lib/components/"
    }
  }
};

export default config;
