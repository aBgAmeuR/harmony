import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    backgroundColor: {
      primary: "#242424",
      secondary: "#1f1f1f",
      tertiary: "#141414",
      green: "#1ED760",
    },
    borderColor: {
      primary: "#1ED760",
      secondary: "#141414",
    },
    colors: {
      green: "#0db14d",
      primary: "#1ED760",
      secondary: "#141414",
      tertiary: "#242424",
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
