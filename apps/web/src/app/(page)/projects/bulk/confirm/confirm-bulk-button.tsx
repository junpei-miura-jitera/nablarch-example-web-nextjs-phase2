"use client";

import type { BulkItem } from "../../_utils/project-types";
import { apiPost } from ":/app/(api)/_utils/client";
import type { InnerProjectForm } from "../../_schemas/project.types";
import { ConfirmButton } from "../../_fragments/confirm-button";

/**
 * プロジェクト一括更新確定ボタン。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/projectBulk/confirmOfUpdate.jsp
 */
export function ConfirmBulkButton({ items }: { items: BulkItem[] }) {
  return (
    <ConfirmButton
      onConfirm={async () => {
        // BulkItem (フォーム値: string) → InnerProjectForm (API 型: enum) へ変換
        const projectList: InnerProjectForm[] = items.map((item) => ({
          ...item,
          projectType: item.projectType as InnerProjectForm["projectType"],
        }));
        // @see _references/nablarch-example-web/src/main/java/.../ProjectBulkAction.java の update メソッド
        await apiPost("/api/projectbulk/update", { projectList });
      }}
      redirectTo="/projects/bulk/complete"
      errorMessage="更新に失敗しました。"
      loadingLabel="更新中..."
    />
  );
}
