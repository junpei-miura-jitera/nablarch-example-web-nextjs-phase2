import { getStorybookNavigationContext } from './navigation-context'

export function useRouter() {
  const context = getStorybookNavigationContext()

  return {
    push: context.push,
    replace: context.push,
    prefetch: async () => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
  }
}

export function usePathname() {
  return getStorybookNavigationContext().pathname
}

export function useSearchParams() {
  return getStorybookNavigationContext().searchParams
}
