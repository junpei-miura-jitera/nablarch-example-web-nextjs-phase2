import type { RefObject } from 'react'

export function ProjectClientFilter({
  clientIdRef,
  clientNameRef,
  clientId,
  clientName,
  onOpenSearch,
  onClear,
}: {
  clientIdRef: RefObject<HTMLInputElement | null>
  clientNameRef: RefObject<HTMLInputElement | null>
  clientId: string
  clientName: string
  onOpenSearch: () => void
  onClear: () => void
}) {
  // NOTE:
  // 顧客検索 badge は JSP と同じ anchor + material-icons に寄せているが、icon glyph の位置が strict pixel compare で
  // 数 px ずれることがある。
  return (
    <div>
      <div className="form-group label-static mb-3">
        <div className="mb-2">
          <label htmlFor="client-name" className="control-label mb-3">
            顧客名
          </label>
          <input
            ref={clientIdRef}
            id="client-id"
            name="clientId"
            readOnly
            className="form-control form-control-lg mb-2"
            placeholder="顧客ID"
            defaultValue={clientId}
          />
          <input
            ref={clientNameRef}
            id="client-name"
            name="clientName"
            readOnly
            className="form-control form-control-lg"
            placeholder="顧客名"
            defaultValue={clientName}
          />
        </div>
        <div className="text-end">
          <a
            href="#"
            className="badge rounded-pill text-dark bg-body-secondary"
            onClick={(event) => {
              event.preventDefault()
              onOpenSearch()
            }}
          >
            <i className="material-icons">search</i>
          </a>
          <a
            href="#"
            className="badge rounded-pill text-dark bg-body-secondary"
            onClick={(event) => {
              event.preventDefault()
              onClear()
            }}
          >
            <i className="material-icons">remove</i>
          </a>
        </div>
      </div>
    </div>
  )
}
