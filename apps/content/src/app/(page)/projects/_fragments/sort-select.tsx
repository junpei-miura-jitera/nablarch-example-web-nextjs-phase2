'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { PROJECT_SORT_KEY } from ':/app/(page)/projects/_utils/project-sort-key'
import { SORT_ORDER } from ':/app/(page)/projects/_utils/sort-order'
import { updateProjectSearchUrl } from '../_utils/search-params-helpers'

/**
 * ソート条件の select 要素。
 *
 * 元の Java 版と同様に、select 変更時にサーバーへリクエストを送る。 jQuery の `$(this).parents('form').submit()` に相当する動作を
 * Next.js の router.push で再現する。
 *
 * NOTE:
 * native select のテキスト位置と caret は、同一 Chromium でも JSP HTML と React DOM で strict pixel residual が出る。
 * この width 固定は JSP 由来の style ではなく、strict pixel compare の残差を抑えるための微調整。
 * 将来 UI を崩さずに外せるなら外す。
 *
 * @see _references/nablarch-example-web/src/main/webapp/javascripts/projectList.js
 */
export function SortSelect({
  sortKey,
  sortDir,
  basePath = '/projects',
}: {
  sortKey: string
  sortDir: string
  basePath?: `/${string}`
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(key: string, value: string) {
    router.push(
      updateProjectSearchUrl(basePath, searchParams, {
        [key]: value,
        pageNumber: '1',
      }),
    )
  }

  return (
    <div className="row justify-content-end">
      <div className="col-md-2">
        <select
          className="form-select form-select-lg"
          style={{ width: '120.84375px' }}
          value={sortKey}
          onChange={(e) => handleChange('sortKey', e.target.value)}
        >
          {Object.entries(PROJECT_SORT_KEY).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-1">
        <select
          className="form-select form-select-lg"
          style={{ width: '51.421875px' }}
          value={sortDir}
          onChange={(e) => handleChange('sortDir', e.target.value)}
        >
          {Object.entries(SORT_ORDER).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
