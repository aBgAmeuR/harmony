import { type Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "896px",
    },
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
      card: "#2e2e2e",
      green: "#0db14d",
      red900: "#7f1d1d",
    },
    borderColor: {
      primary: "#1ED760",
      secondary: "#141414",
      red600: "#dc2626",
    },
    colors: {
      white: "#ffffff",
      green: "#0db14d",
      primary: "#1ED760",
      secondary: "#141414",
      tertiary: "#242424",
      red100: "#fee2e2",
      red200: "#fecaca",
      outlinegreen: "#1ED760",
    },
    textColor: {
      lightwhite: "#c9c9c9",
      green: "#0db14d",
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("no-hover", "@media (hover: none)")
    }),
    require("tailwindcss-animate"),
  ],
}
export default config
