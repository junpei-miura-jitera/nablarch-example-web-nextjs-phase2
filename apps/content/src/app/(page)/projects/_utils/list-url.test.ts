/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { getSavedListUrl, LIST_URL_KEY, sanitizeListUrl, saveCurrentListUrl } from './list-url'

afterEach(() => {
  sessionStorage.clear()
})

describe('sanitizeListUrl', () => {
  it('returns the fallback when the raw value is missing or invalid', () => {
    expect(sanitizeListUrl(undefined)).toBe('/projects')
    expect(sanitizeListUrl('//evil.example.com')).toBe('/projects')
    expect(sanitizeListUrl('not a url')).toBe('/projects')
  })

  it('keeps relative app paths and strips external origins', () => {
    expect(sanitizeListUrl('/projects?pageNumber=2')).toBe('/projects?pageNumber=2')
    expect(sanitizeListUrl('https://example.com/projects?sortKey=name')).toBe(
      '/projects?sortKey=name',
    )
  })
})

describe('saveCurrentListUrl / getSavedListUrl', () => {
  it('stores the current list url in sessionStorage', () => {
    saveCurrentListUrl('/projects', new URLSearchParams('pageNumber=3&sortDir=desc'))

    expect(sessionStorage.getItem(LIST_URL_KEY)).toBe('/projects?pageNumber=3&sortDir=desc')
    expect(getSavedListUrl()).toBe('/projects?pageNumber=3&sortDir=desc')
  })

  it('normalizes string search params by removing a leading question mark', () => {
    saveCurrentListUrl('/projects', '?pageNumber=1')

    expect(getSavedListUrl()).toBe('/projects?pageNumber=1')
  })
})
