import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ApiProjectDto } from ':/app/(page)/projects/_utils/api/project'
import { API_BASE_URL } from ':/bases/env.server'
import { LayoutFooter } from '../../_components/layouts/layout-footer'
import { LayoutHeader } from '../../_components/layouts/layout-header'
import { parseProjectIdFromRouteSegment } from '../../_utils/route-params'
import { EditProjectForm } from './edit-project-form'

/**
 * プロジェクト変更画面のメタデータ。
 */
export const metadata: Metadata = {
  title: 'プロジェクト変更画面',
}

/**
 * プロジェクト変更画面。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/update.jsp
 */
export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const projectId = parseProjectIdFromRouteSegment(id)
  if (projectId === null) notFound()

  const res = await fetch(`${API_BASE_URL}/api/project/show?projectId=${projectId}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const project: ApiProjectDto = await res.json()

  return (
    <>
      <LayoutHeader />
      <section>
        <EditProjectForm project={project} projectId={projectId} />
      </section>
      <LayoutFooter />
    </>
  )
}
