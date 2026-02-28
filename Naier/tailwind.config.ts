import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        mist: "#f4f1ea",
        sand: "#e5d7bf",
        ember: "#bc6c25",
        pine: "#2f5d50",
        steel: "#64748b"
      },
      boxShadow: {
        card: "0 18px 50px rgba(17, 24, 39, 0.12)"
      },
      borderRadius: {
        panel: "1.5rem"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
