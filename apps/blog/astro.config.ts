import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// TODO: replace with actual domain before going live
const SITE_URL = process.env.SITE_URL ?? "https://example.com";

export default defineConfig({
  site: SITE_URL,
  output: "static",
  integrations: [
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
