import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ApiProjectDto } from ':/shared/api/project'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:9090'

export const metadata: Metadata = { title: 'プロジェクト変更画面' }
import { parseProjectIdFromRouteSegment } from '../../_utils/route-params'
import { EditProjectForm } from './edit-project-form'

/**
 * プロジェクト変更画面。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/update.jsp
 */
export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const projectId = parseProjectIdFromRouteSegment(id)
  if (projectId === null) notFound()

  const res = await fetch(`${API_BASE}/api/project/show?projectId=${projectId}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const project: ApiProjectDto = await res.json()

  return (
    <section>
      <EditProjectForm project={project} projectId={projectId} />
    </section>
  )
}
