'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ApiClientDto, ApiIndustryDto } from ':/shared/api/client'

/**
 * 顧客選択時のコールバック引数。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/client/index.jsp
 */
type ClientSelection = {
  clientId: number
  clientName: string
}

/**
 * ClientSearchModal の props。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/client/index.jsp
 */
type ClientSearchModalProps = {
  // モーダル表示中かどうか
  isOpen: boolean
  // モーダルを閉じる
  onClose: () => void
  // 顧客選択時
  onSelect: (client: ClientSelection) => void
}

/**
 * 顧客検索モーダルダイアログ。
 *
 * 顧客名・業種で検索し、結果一覧から顧客を選択する。 選択すると onSelect コールバックで clientId/clientName を返す。
 *
 * IsOpen が false → null を返す。true → ClientSearchModalContent をマウントする。 マウント時に初期検索が走るため、effect 内の
 * setState が不要になる。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/client/index.jsp
 * @see _references/nablarch-example-web/src/main/webapp/javascripts/clientList.js
 */
export function ClientSearchModal({ isOpen, onClose, onSelect }: ClientSearchModalProps) {
  if (!isOpen) return null
  return <ClientSearchModalContent onClose={onClose} onSelect={onSelect} />
}

/**
 * モーダル本体（マウント時に初期検索を実行する）。
 */
function ClientSearchModalContent({
  onClose,
  onSelect,
}: {
  onClose: () => void
  onSelect: (client: ClientSelection) => void
}) {
  const [clientName, setClientName] = useState('')
  const [industryCode, setIndustryCode] = useState('')
  const [industries, setIndustries] = useState<ApiIndustryDto[]>([])
  const [results, setResults] = useState<ApiClientDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [errorLevel, setErrorLevel] = useState<'warning' | 'danger'>('warning')

  // マウント時に業種一覧と初期検索を実行
  useEffect(() => {
    // @see _references/nablarch-example-web/src/main/java/.../IndustryAction.java
    fetch('/api/industry/find')
      .then(async (res) => {
        if (!res.ok) throw new Error()
        return (await res.json()) as ApiIndustryDto[]
      })
      .then((data) => setIndustries(data ?? []))
      .catch(() => {
        setErrorLevel('danger')
        setError('業種一覧の取得に失敗しました。')
      })

    // — clientList.js の $.ajax 呼び出しに対応
    fetch('/api/client/find')
      .then(async (res) => {
        if (!res.ok) throw new Error()
        return (await res.json()) as ApiClientDto[]
      })
      .then((data) => setResults(data ?? []))
      .catch(() => {
        setErrorLevel('danger')
        setError('顧客一覧の取得に失敗しました。')
      })
  }, [])

  const handleSearch = useCallback(async () => {
    setError(null)
    setResults([])
    try {
      // — clientList.js の $.ajax 呼び出しに対応
      const qs = new URLSearchParams()
      if (clientName) qs.set('clientName', clientName)
      if (industryCode) qs.set('industryCode', industryCode)
      const query = qs.toString()
      const res = await fetch(`/api/client/find${query ? `?${query}` : ''}`)
      if (!res.ok) {
        if (res.status === 400) {
          // — clientList.js L88-93: <ul><li> でメッセージを一覧表示
          const body = (await res.json()) as { message: string }[] | null
          setErrorLevel('warning')
          setError(
            Array.isArray(body)
              ? body.map((m) => m.message).join('\n')
              : '検索処理に失敗しました。',
          )
          return
        }
        throw new Error(`API error ${res.status}`)
      }
      const data = (await res.json()) as ApiClientDto[]
      setResults(data ?? [])
    } catch {
      setErrorLevel('danger')
      setError('検索処理に失敗しました。')
    }
  }, [clientName, industryCode])

  const handleSelectClient = useCallback(
    (client: ApiClientDto) => {
      if (client.clientId == null) return
      onSelect({
        clientId: client.clientId,
        clientName: client.clientName ?? '',
      })
      onClose()
    },
    [onSelect, onClose],
  )

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-search-title"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content client">
          <div className="modal-body">
            <div className="navbar navbar-expand-md bg-main" data-bs-theme="dark">
              <div className="container-fluid">
                <span id="client-search-title" className="navbar-brand">
                  顧客検索一覧画面
                </span>
                <button type="button" className="btn-close btn-close-white" onClick={onClose} />
              </div>
            </div>

            {error && (
              <div className={`alert alert-${errorLevel} alert-dismissible m-3`}>
                {/* — index.jsp L19: data-bs-dismiss="modal" — 元はモーダルごと閉じる */}
                <button type="button" className="btn-close" onClick={onClose} />
                <ul className="mb-0">
                  {error.split('\n').map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="row m-3">
              <label htmlFor="search-client-name" className="col-md-2 m-auto col-form-label">
                顧客名
              </label>
              <div className="col-md-10">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="search-client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
            </div>

            <div className="row m-3">
              <label htmlFor="search-industry-code" className="col-md-2 m-auto col-form-label">
                業種
              </label>
              <div className="col-md-10">
                <select
                  id="search-industry-code"
                  className="form-control form-control-lg"
                  value={industryCode}
                  onChange={(e) => setIndustryCode(e.target.value)}
                >
                  <option value="">すべて</option>
                  {industries.map((ind) => (
                    <option key={ind.industryCode} value={ind.industryCode ?? ''}>
                      {ind.industryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end m-3">
              <button type="button" className="btn btn-lg btn-primary" onClick={handleSearch}>
                検索
              </button>
            </div>

            <div style={{ overflowY: 'scroll', height: '250px' }} className="col-md-12">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>顧客ID</th>
                    <th>顧客名</th>
                    <th>業種</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((client) => (
                    <tr key={client.clientId}>
                      <td>
                        {client.clientId != null ? (
                          <button type="button" onClick={() => handleSelectClient(client)}>
                            {client.clientId}
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{client.clientName}</td>
                      <td>{client.industryName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
