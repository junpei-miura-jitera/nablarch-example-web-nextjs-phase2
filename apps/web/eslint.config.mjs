import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // 生成コードに空 interface が含まれるため許容
      '@typescript-eslint/no-empty-object-type': 'off',
      // 元の JSP から移植した Google Fonts リンクのため許容
      '@next/next/google-font-display': 'warn',
      '@next/next/no-page-custom-font': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
