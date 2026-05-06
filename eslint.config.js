import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommendedTypeChecked,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    prefer: "type-imports",
                },
            ],
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "react-refresh/only-export-components": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksVoidReturn: {
                        attributes: false,
                    },
                },
            ],
            "@typescript-eslint/only-throw-error": "error",
            "@typescript-eslint/switch-exhaustiveness-check": "error",
        },
    },
    {
        files: ["cypress.config.ts", "cypress/**/*.ts"],
        rules: {
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
        },
    },
]);
