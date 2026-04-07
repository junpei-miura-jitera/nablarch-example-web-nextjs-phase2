'use client'

import type { ApiProjectUpdateFormValues } from ':/app/(page)/projects/_utils/api/project'
import { ConfirmButton } from '../../../_fragments/confirm-button'
import { transformProjectFormData } from ':/app/(page)/projects/_utils/project-form-helpers'

/**
 * Cookie から復元されるフォームデータ。楽観ロック用の projectId / version を含む。
 */
type CookieFormData = ApiProjectUpdateFormValues & { projectId?: number; version?: number }

/**
 * プロジェクト更新確定ボタン。
 *
 * FormData には Cookie 経由で projectId / version が含まれる。 楽観ロック用の version を確実に API に送信するため、明示的に body
 * へ展開する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/confirmOfUpdate.jsp
 * @see _references/nablarch-example-web/src/main/java/.../ProjectAction.java の update メソッド
 */
export function ConfirmUpdateButton({
  projectId,
  formData,
}: {
  projectId: number
  formData: CookieFormData
}) {
  // Cookie から復元した formData に含まれる projectId / version を取り出す
  const { projectId: pid, version, ...rest } = formData

  return (
    <ConfirmButton
      onConfirm={async () => {
        // projectId・version は OpenAPI スキーマ外のフィールドだが、
        // Nablarch の楽観ロック制御に必要なため明示的に含める
        const res = await fetch('/api/project/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...transformProjectFormData(rest),
            projectId: pid ?? projectId,
            version: version ?? 0,
          }),
        })
        const data = (await res.json().catch(() => null)) as { ok?: boolean } | null
        if (!res.ok || !data?.ok) throw new Error(`API error ${res.status}`)
      }}
      redirectTo={`/projects/${projectId}/edit/complete`}
      errorMessage="更新に失敗しました。"
    />
  )
}
