const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "prettier",
    require.resolve("@vercel/style-guide/eslint/next"),
    "plugin:tailwindcss/recommended",
    "plugin:@tanstack/query/recommended",
    "turbo",
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
  },
  plugins: ["only-warn", "simple-import-sort", "prettier", "@typescript-eslint"],
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
    tailwindcss: {
      callees: ["cn"],
      config: "tailwind.config.ts"
    }
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
        singleQuote: false
      }
    ],
    "sort-imports": "off",
    "tailwindcss/classnames-order": "off",
    "tailwindcss/no-custom-classname": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@next/next/no-img-element": "off",
    "simple-import-sort/imports": [
      2,
      {
        groups: [
          ["^.+\\.s?css$"],
          [
            `^(${require("module").builtinModules.join("|")})(/|$)`,
            "^react",
            "^@?\\w",
          ],
          ["^~"],
          ["^components(/.*|$)"],
          ["^lib(/.*|$)", "^hooks(/.*|$)"],
          ["^\\."]
        ]
      }
    ]
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    "postcss.config.mjs",
  ],
  overrides: [{ files: ["*.js?(x)", "*.ts?(x)"] }],
};
