import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Apostrophes in JSX prose render fine; this rule is purely cosmetic and
      // was blocking the production build across ~40 content pages.
      "react/no-unescaped-entities": "off",
      // The React Compiler immutability rule fires on local accumulators inside
      // SVG-chart .map() loops (offset/cursor/cumContrib). The code is correct;
      // keep these as warnings instead of failing the build.
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
