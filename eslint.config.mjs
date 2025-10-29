// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: [
      'dist/**', // compiled files
      'node_modules/**', // deps
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Turn off noisy "unsafe" rules
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      // Allow `any` when needed
      '@typescript-eslint/no-explicit-any': 'off',

      // Disable promise-floating scream
      '@typescript-eslint/no-floating-promises': 'off',

      // Keep the essentials
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
);
