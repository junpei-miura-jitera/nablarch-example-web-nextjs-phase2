/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildPageUrl,
  buildPeriodSearchUrl,
  buildProjectSearchParams,
  normalizeProjectSearchParams,
  searchParamsToRecord,
  toArray,
  toSingle,
  updateProjectSearchUrl,
} from './search-params-helpers'

describe('toArray / toSingle', () => {
  it('normalizes scalar and array-like query values', () => {
    expect(toArray(undefined)).toBeUndefined()
    expect(toArray('a')).toEqual(['a'])
    expect(toArray(['a', 'b'])).toEqual(['a', 'b'])

    expect(toSingle(undefined)).toBeUndefined()
    expect(toSingle('a')).toBe('a')
    expect(toSingle(['a', 'b'])).toBe('a')
  })
})

describe('normalizeProjectSearchParams', () => {
  it('keeps single-value params as strings and projectClass as an array', () => {
    expect(
      normalizeProjectSearchParams({
        pageNumber: ['7', '8'],
        clientName: 'Acme',
        projectClass: 'a',
        sortKey: ['projectName'],
      }),
    ).toEqual({
      pageNumber: '7',
      clientId: undefined,
      clientName: 'Acme',
      projectName: undefined,
      projectType: undefined,
      projectClass: ['a'],
      projectStartDateBegin: undefined,
      projectStartDateEnd: undefined,
      projectEndDateBegin: undefined,
      projectEndDateEnd: undefined,
      sortKey: 'projectName',
      sortDir: undefined,
    })
  })
})

describe('buildProjectSearchParams', () => {
  it('merges overrides, keeps repeated params, and omits blanks', () => {
    const result = buildProjectSearchParams(
      {
        pageNumber: '2',
        clientName: 'Acme',
        projectClass: ['a', 'b'],
        projectType: '',
      },
      {
        pageNumber: '1',
        sortKey: 'projectName',
      },
    )

    expect(result.toString()).toBe(
      'pageNumber=1&clientName=Acme&projectClass=a&projectClass=b&sortKey=projectName',
    )
  })
})

describe('searchParamsToRecord', () => {
  it('collects repeated keys into arrays', () => {
    const result = searchParamsToRecord(
      new URLSearchParams('projectClass=a&projectClass=b&clientName=Acme'),
    )

    expect(result).toEqual({
      projectClass: ['a', 'b'],
      clientName: 'Acme',
    })
  })
})

describe('buildPeriodSearchUrl', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-04T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('carries form values, falls back to current search params, and adds the selected period', () => {
    document.body.innerHTML = `
      <form id="search-form">
        <input name="clientId" value="123" />
        <input name="clientName" value="Acme" />
        <input name="projectName" value="Migration" />
        <input type="checkbox" name="projectClass" value="a" checked />
        <input type="checkbox" name="projectClass" value="b" checked />
        <input name="sortKey" value="projectName" />
      </form>
    `
    const form = document.querySelector('form')
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('search form was not created')
    }

    const url = buildPeriodSearchUrl(
      'startThisYear',
      { current: form } as Parameters<typeof buildPeriodSearchUrl>[1],
      '/projects',
      new URLSearchParams('projectType=development&sortDir=desc&pageNumber=9'),
    )
    const searchParams = new URL(`http://localhost${url}`).searchParams

    expect(new URL(`http://localhost${url}`).pathname).toBe('/projects')
    expect(searchParams.get('clientId')).toBe('123')
    expect(searchParams.get('clientName')).toBe('Acme')
    expect(searchParams.get('projectName')).toBe('Migration')
    expect(searchParams.get('projectType')).toBe('development')
    expect(searchParams.get('sortKey')).toBe('projectName')
    expect(searchParams.get('sortDir')).toBe('desc')
    expect(searchParams.getAll('projectClass')).toEqual(['a', 'b'])
    expect(searchParams.get('pageNumber')).toBe('1')
    expect(searchParams.get('projectStartDateBegin')).toBe('20260101')
    expect(searchParams.get('projectStartDateEnd')).toBe('20261231')
  })
})

describe('buildPageUrl / updateProjectSearchUrl', () => {
  it('builds page links from search params and updates existing query strings', () => {
    expect(
      buildPageUrl(
        '/projects',
        { clientName: 'Acme', projectClass: ['a', 'b'], pageNumber: '2' },
        7,
      ),
    ).toBe('/projects?pageNumber=7&clientName=Acme&projectClass=a&projectClass=b')

    expect(
      updateProjectSearchUrl(
        '/projects',
        new URLSearchParams('clientName=Acme&pageNumber=2&projectClass=a&projectClass=b'),
        {
          pageNumber: '1',
          clientName: '',
          sortDir: 'desc',
        },
      ),
    ).toBe('/projects?pageNumber=1&projectClass=a&projectClass=b&sortDir=desc')
  })
})
