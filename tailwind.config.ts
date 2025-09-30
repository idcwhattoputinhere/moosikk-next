import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "dvd-move": "move 10s linear infinite",
      },
      keyframes: {
        move: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(50vw, 0)" },
          "50%": { transform: "translate(50vw, 50vh)" },
          "75%": { transform: "translate(0, 50vh)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
