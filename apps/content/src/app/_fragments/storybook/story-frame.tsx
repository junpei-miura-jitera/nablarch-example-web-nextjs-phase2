import type { ReactNode } from 'react'

export function ProjectCardStoryFrame({ children }: { children: ReactNode }) {
  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-body">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function ProjectPageStoryFrame({ children }: { children: ReactNode }) {
  return <div className="container-fluid p-4">{children}</div>
}
