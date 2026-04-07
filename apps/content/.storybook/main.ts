import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig, transformWithEsbuild } from 'vite'

const storybookDir = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(storybookDir, '../src')
const publicDir = resolve(storybookDir, '../public')
const nextNavigationMock = resolve(storybookDir, './next-navigation.mock.ts')
const nextLinkMock = resolve(storybookDir, './next-link.mock.tsx')
const srcPattern = new RegExp(`${srcDir.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*\\.[jt]sx?$`)

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  staticDirs: [publicDir],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          ':': srcDir,
          'next/navigation': nextNavigationMock,
          'next/link': nextLinkMock,
        },
      },
      esbuild: {
        include: srcPattern,
        loader: 'tsx',
      },
      plugins: [
        {
          name: 'transform-src-tsx',
          async transform(code: string, id: string) {
            if (!srcPattern.test(id)) return null

            return transformWithEsbuild(code, id, {
              loader: id.endsWith('.tsx') ? 'tsx' : 'ts',
              jsx: 'automatic',
            })
          },
        },
      ],
    })
  },
}

export default config
