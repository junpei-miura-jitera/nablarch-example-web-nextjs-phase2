'use client'

import type { ApiProjectFormValues } from ':/shared/api/project'
import { ConfirmButton } from '../../_fragments/confirm-button'
import { transformProjectFormData } from '../../_utils/project-form-helpers'

/**
 * プロジェクト登録確定ボタン。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/confirmOfCreate.jsp
 */
export function ConfirmCreateButton({ formData }: { formData: ApiProjectFormValues }) {
  return (
    <ConfirmButton
      onConfirm={async () => {
        // @see _references/nablarch-example-web/src/main/java/.../ProjectAction.java の create メソッド
        const res = await fetch('/api/project/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transformProjectFormData(formData)),
        })
        if (!res.ok) throw new Error(`API error ${res.status}`)
      }}
      redirectTo="/projects/new/complete"
      errorMessage="登録に失敗しました。"
    />
  )
}
