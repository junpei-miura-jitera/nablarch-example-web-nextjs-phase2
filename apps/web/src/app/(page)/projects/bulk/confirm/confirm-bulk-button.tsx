'use client'

import type { ApiProjectBulkItemValues } from ':/shared/api/project-bulk'
import { ConfirmButton } from '../../_fragments/confirm-button'

/**
 * プロジェクト一括更新確定ボタン。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/projectBulk/confirmOfUpdate.jsp
 */
export function ConfirmBulkButton({ items }: { items: ApiProjectBulkItemValues[] }) {
  return (
    <ConfirmButton
      onConfirm={async () => {
        // @see _references/nablarch-example-web/src/main/java/.../ProjectBulkAction.java の update メソッド
        const res = await fetch('/api/projectbulk/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectList: items }),
        })
        const data = (await res.json().catch(() => null)) as { ok?: boolean } | null
        if (!res.ok || !data?.ok) throw new Error(`API error ${res.status}`)
      }}
      redirectTo="/projects/bulk/complete"
      errorMessage="更新に失敗しました。"
    />
  )
}
