// ESLint Configuration - Strict TypeScript rules with practical exceptions
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }],
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    
    // Allow certain patterns for practical development
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    
    // React specific
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'off',
    
    // General JavaScript
    'no-console': 'off', // Allow console for debugging
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-var': 'error',
    'prefer-const': 'error',
    'no-unused-expressions': 'error',
    
    // Import rules
    'import/no-unused-modules': 'off',
    'import/order': ['warn', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'never'
    }]
  },
  overrides: [
    {
      // Relax rules for test files
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      }
    },
    {
      // Relax rules for config files
      files: ['*.config.js', '*.config.ts', 'next.config.js', 'tailwind.config.js'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-var-requires': 'off',
      }
    },
    {
      // Relax rules for migration/legacy files
      files: ['**/legacy/**/*', '**/deprecated/**/*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'build/',
    'dist/',
    '*.min.js',
    'public/',
    '.eslintrc.js'
  ]
};