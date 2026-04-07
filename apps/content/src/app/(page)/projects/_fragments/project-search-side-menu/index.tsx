'use client'

import { useCallback, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ClientSearchModal, type ClientSelection } from ':/app/(page)/projects/_components/client-search-modal'
import { buildPeriodSearchUrl } from '../../_utils/search-params-helpers'
import { ProjectClassFilter } from './project-class-filter'
import { ProjectClientFilter } from './project-client-filter'
import { ProjectNameFilter } from './project-name-filter'
import { ProjectPeriodLinks } from './project-period-links'
import { SearchHiddenFields } from './search-hidden-fields'

export function ProjectSearchSideMenu({ projectNameError }: { projectNameError?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)

  const formActionPath = pathname.startsWith('/projects/bulk') ? '/projects/bulk' : '/projects'
  const clientIdRef = useRef<HTMLInputElement>(null)
  const clientNameRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleClientSelect = useCallback((client: ClientSelection) => {
    if (clientIdRef.current) {
      clientIdRef.current.value = String(client.clientId)
    }
    if (clientNameRef.current) {
      clientNameRef.current.value = client.clientName
    }
  }, [])

  const handleClientClear = useCallback(() => {
    if (clientIdRef.current) {
      clientIdRef.current.value = ''
    }
    if (clientNameRef.current) {
      clientNameRef.current.value = ''
    }
  }, [])

  const handlePeriodClick = useCallback(
    (type: 'startThisYear' | 'endThisYear' | 'endLastYear') => (event: React.MouseEvent) => {
      event.preventDefault()
      router.push(
        buildPeriodSearchUrl(type, formRef, formActionPath, new URLSearchParams(searchParams.toString())),
      )
    },
    [formActionPath, router, searchParams],
  )

  const handleCheckboxChange = useCallback(() => {
    formRef.current?.requestSubmit()
  }, [])

  return (
    <nav className="col-md-2 menu">
      <div className="card">
        <div className="card-body">
          <ul>
            <li>
              <div className="sideMenu">
                <h4 className="text-muted fs-4 mb-3">
                  <strong>プロジェクトをさがす</strong>
                </h4>
                <form ref={formRef} method="GET" action={formActionPath} key={searchParams.toString()}>
                  <SearchHiddenFields searchParams={searchParams} />

                  <ul>
                    <ProjectClassFilter
                      selectedProjectClasses={searchParams.getAll('projectClass')}
                      onChange={handleCheckboxChange}
                    />
                    <ProjectPeriodLinks onClick={handlePeriodClick} />
                  </ul>

                  <fieldset>
                    <ProjectClientFilter
                      clientIdRef={clientIdRef}
                      clientNameRef={clientNameRef}
                      clientId={searchParams.get('clientId') ?? ''}
                      clientName={searchParams.get('clientName') ?? ''}
                      onOpenSearch={() => setIsClientModalOpen(true)}
                      onClear={handleClientClear}
                    />
                    <ProjectNameFilter
                      defaultValue={searchParams.get('projectName') ?? ''}
                      errorMessage={projectNameError}
                    />

                    <div className="d-flex justify-content-center">
                      <input id="search" type="submit" className="btn btn-lg btn-primary" value="検索" />
                    </div>
                  </fieldset>
                </form>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <ClientSearchModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelect={handleClientSelect}
      />
    </nav>
  )
}
