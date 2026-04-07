declare module 'vite' {
  export function mergeConfig<T, U>(base: T, overrides: U): T & U

  export function transformWithEsbuild(
    code: string,
    filename: string,
    options: {
      loader: 'ts' | 'tsx'
      jsx?: 'automatic' | 'transform' | 'preserve'
    },
  ): Promise<unknown>
}
