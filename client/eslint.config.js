import js from '@eslint/js'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  // ─── Fichiers ignorés ─────────────────────────────────────────────────────
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js',
      'vite.config.ts',
    ],
  },

  // ─── Règles JS de base ────────────────────────────────────────────────────
  js.configs.recommended,

  // ─── Prettier ─────────────────────────────────────────────────────────────
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      ...prettierConfig.rules, // Désactive les règles ESLint qui conflictent avec Prettier
      'prettier/prettier': 'error', // Les erreurs de formatage Prettier deviennent des erreurs ESLint
    },
  },

  // ─── TypeScript ───────────────────────────────────────────────────────────
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: {
      parser: tsParser, // Parser TypeScript au lieu du parser JS par défaut
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }, // Active le support JSX pour les .tsx
      },
      globals: {
        ...globals.browser, // Variables globales browser : window, document, navigator...
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules, // Règles TS recommandées
      '@typescript-eslint/no-explicit-any': 'warn', // Avertit sur l'usage de `any`
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Erreur si variable inutilisée
      'no-console': 'warn', // Avertit si console.log oublié
    },
  },
]
