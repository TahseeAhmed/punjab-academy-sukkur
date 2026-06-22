import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // This app fetches data with plain async functions called from useEffect
      // (the standard pattern pre-React Query/use()). That's intentional, not a bug.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['**/context/*.jsx'],
    rules: {
      // Context files conventionally export both a Provider component and a useX hook.
      'react-refresh/only-export-components': 'off',
    },
  },
])
