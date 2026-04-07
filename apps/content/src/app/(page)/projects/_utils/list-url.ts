export const LIST_URL_KEY = 'listUrl'

export function sanitizeListUrl(raw: string | null | undefined, fallback = '/projects') {
  if (!raw) return fallback

  try {
    if (raw.startsWith('/') && !raw.startsWith('//')) {
      return raw
    }

    const parsedUrl = new URL(raw)
    return parsedUrl.pathname + parsedUrl.search
  } catch {
    return fallback
  }
}

export function getSavedListUrl(fallback = '/projects') {
  return sanitizeListUrl(sessionStorage.getItem(LIST_URL_KEY), fallback)
}

export function saveCurrentListUrl(
  pathname: string,
  searchParams?: URLSearchParams | string | null,
) {
  const serialized =
    searchParams instanceof URLSearchParams
      ? searchParams.toString()
      : searchParams?.replace(/^\?/, '') ?? ''

  sessionStorage.setItem(
    LIST_URL_KEY,
    `${pathname}${serialized === '' ? '' : `?${serialized}`}`,
  )
}
