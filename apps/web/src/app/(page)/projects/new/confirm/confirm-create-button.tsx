"use client";

import { apiPost } from ":/app/(api)/_utils/client";
import type { ProjectForm } from "../../_schemas/project.types";
import { ConfirmButton } from "../../_fragments/confirm-button";

/**
 * プロジェクト登録確定ボタン。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/confirmOfCreate.jsp
 */
export function ConfirmCreateButton({ formData }: { formData: ProjectForm }) {
  return (
    <ConfirmButton
      onConfirm={async () => {
        // @see _references/nablarch-example-web/src/main/java/.../ProjectAction.java の create メソッド
        await apiPost("/api/project/create", formData);
      }}
      redirectTo="/projects/new/complete"
      errorMessage="登録に失敗しました。"
      loadingLabel="登録中..."
    />
  );
}
