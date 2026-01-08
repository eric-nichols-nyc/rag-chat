import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
    "./mdx-components.{ts,tsx}",
    "./node_modules/fumadocs-ui/dist/**/*.js",
  ],
  // Note: Tailwind CSS v4 uses CSS-based configuration via PostCSS
  // The preset is not needed with Tailwind v4 and fumadocs-ui@16.2.2
};

export default config;
