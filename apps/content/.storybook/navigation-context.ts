type NavigationContextState = {
  pathname: string
  searchParams: URLSearchParams
  push: (href: string) => void
}

const defaultState: NavigationContextState = {
  pathname: '/projects',
  searchParams: new URLSearchParams(),
  push: () => {},
}

let state: NavigationContextState = defaultState

export function setStorybookNavigationContext(
  partial: Partial<Omit<NavigationContextState, 'searchParams'>> & {
    searchParams?: URLSearchParams | string | Record<string, string | string[]>
  },
) {
  const nextSearchParams =
    partial.searchParams instanceof URLSearchParams
      ? partial.searchParams
      : typeof partial.searchParams === 'string'
        ? new URLSearchParams(partial.searchParams)
        : partial.searchParams
          ? buildSearchParams(partial.searchParams)
          : state.searchParams

  state = {
    pathname: partial.pathname ?? state.pathname,
    searchParams: nextSearchParams,
    push: partial.push ?? state.push,
  }
}

export function resetStorybookNavigationContext() {
  state = {
    pathname: defaultState.pathname,
    searchParams: new URLSearchParams(),
    push: defaultState.push,
  }
}

export function getStorybookNavigationContext() {
  return state
}

function buildSearchParams(values: Record<string, string | string[]>) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item)
      }
      continue
    }

    searchParams.set(key, value)
  }

  return searchParams
}
