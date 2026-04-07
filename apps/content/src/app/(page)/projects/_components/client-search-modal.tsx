'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ApiClientDto, ApiIndustryDto } from ':/app/(page)/projects/_utils/api/client'

/**
 * 顧客選択時のコールバック引数。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/client/index.jsp
 */
export type ClientSelection = {
  clientId: number
  clientName: string
}

/**
 * ClientSearchModal の props。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/client/index.jsp
 */
type ClientSearchModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (client: ClientSelection) => void
}

/**
 * 顧客検索モーダルダイアログ。
 *
 * 顧客名・業種で検索し、結果一覧から顧客を選択する。選択すると
 * onSelect コールバックで clientId/clientName を返す。
 */
export function ClientSearchModal({ isOpen, onClose, onSelect }: ClientSearchModalProps) {
  if (!isOpen) return null
  return <ClientSearchModalContent onClose={onClose} onSelect={onSelect} />
}

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

  useEffect(() => {
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
      const queryParams = new URLSearchParams()
      if (clientName) queryParams.set('clientName', clientName)
      if (industryCode) queryParams.set('industryCode', industryCode)
      const query = queryParams.toString()
      const res = await fetch(`/api/client/find${query ? `?${query}` : ''}`)
      if (!res.ok) {
        if (res.status === 400) {
          const body = (await res.json()) as { message: string }[] | null
          setErrorLevel('warning')
          setError(
            Array.isArray(body)
              ? body.map((message) => message.message).join('\n')
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
    [onClose, onSelect],
  )

  return (
    <div
      id="client-search-dialog"
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-search-title"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content client">
          <div className="modal-body">
            <div className="navbar navbar-expand-md bg-main" data-bs-theme="dark">
              <div className="container-fluid">
                <div className="navbar-header">
                  <span id="client-search-title" className="navbar-brand">
                    顧客検索一覧画面
                  </span>
                </div>
              </div>
            </div>

            <div
              id="message-area"
              className={`alert alert-${errorLevel} alert-dismissible m-3`}
              style={{ display: error ? undefined : 'none' }}
            >
              <div>
                {error?.includes('\n') ? (
                  <ul className="mb-0">
                    {error.split('\n').map((message, index) => (
                      <li key={index}>{message}</li>
                    ))}
                  </ul>
                ) : (
                  error
                )}
              </div>
            </div>

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
                  onChange={(event) => setClientName(event.target.value)}
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
                  onChange={(event) => setIndustryCode(event.target.value)}
                >
                  <option value="" />
                  {industries.map((industry) => (
                    <option key={industry.industryCode} value={industry.industryCode ?? ''}>
                      {industry.industryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end m-3">
              <a
                id="client-search"
                href="#"
                className="btn btn-lg btn-primary"
                onClick={(event) => {
                  event.preventDefault()
                  void handleSearch()
                }}
              >
                検索
              </a>
            </div>

            <div style={{ overflowY: 'scroll', height: '250px' }} className="col-md-12">
              <table id="search-result" className="table table-striped table-hover">
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
                          <>
                            <a
                              href="#"
                              onClick={(event) => {
                                event.preventDefault()
                                handleSelectClient(client)
                              }}
                            >
                              {client.clientId}
                            </a>
                            <span className="id" hidden>
                              {client.clientId}
                            </span>
                            <span className="name" hidden>
                              {client.clientName}
                            </span>
                          </>
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
