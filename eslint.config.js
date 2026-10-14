import tseslint from 'typescript-eslint'
export default tseslint.config(
  { ignores: ['dist/**', 'playwright-report/**', 'test-results/**', 'public/mockServiceWorker.js'] },
  ...tseslint.configs.recommended,
)
