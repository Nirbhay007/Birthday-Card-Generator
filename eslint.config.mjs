import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-qa/**",
    ".open-next/**",
    ".wrangler/**",
    ".vercel/**",
    "playwright-report/**",
    "test-results/**",
    "qa/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "worker-configuration.d.ts",
  ]),
]);

export default eslintConfig;
