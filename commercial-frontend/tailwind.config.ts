import { Config } from "tailwindcss";

import plugin from "tailwindcss/plugin";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        text: "var(--text)",
        background: "var(--background)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        "button-active-outline": "var(--button-active-outline)",
        "button-active-filled": "var(--button-active-filled)",
      },
      animation: {
        typing: "typing 1s steps(35), cursor .6s step-end infinite alternate",
        appearFromTop: "appearFromTop 1s 1s ease-in-out",
        appearBlocks: "appearBlocks linear",
        textChange: "text-change 0.3s ease-out;",
      },
      keyframes: {
        typing: {
          from: { width: "0" },
        },
        cursor: {
          "50%": { borderColor: "transparent" },
        },
        appearFromTop: {
          "0%": { transform: "translateY(-60%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        appearBlocks: {
          from: {
            opacity: "0",
            scale: "0.5",
          },
          to: {
            opacity: "1",
            scale: "1",
          },
        },
        textChange: {
          "0%": { backgroundColor: "var(--primary)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities }) {
      matchUtilities(
        {
          "animation-timeline": (value: string) => ({
            "animation-timeline": value,
          }),
        },
        {
          values: {
            view: "view()",
            scroll: "scroll()",
            none: "none",
            auto: "auto",
          },
        },
      );
    }),
    plugin(function ({ matchUtilities }) {
      matchUtilities(
        {
          "animation-range": (value: string) => ({
            "animation-range": value,
          }),
        },
        { values: { appearBlocks: "entry 0% cover 40%" } },
      );
    }),
  ],
} as Config;
