import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-qa/**",
    ".vercel/**",
    "qa/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated test artifacts
    "playwright-report/**",
    "test-results/**",
    "blob-report/**",
  ]),
]);

export default eslintConfig;
