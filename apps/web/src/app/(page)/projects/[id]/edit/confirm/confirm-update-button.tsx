"use client";

import { apiPost } from ":/app/(api)/_utils/client";
import type { ProjectUpdateForm } from "../../../_schemas/project.types";
import { ConfirmButton } from "../../../_fragments/confirm-button";

/** Cookie から復元されるフォームデータ。楽観ロック用の projectId / version を含む。 */
type CookieFormData = ProjectUpdateForm & { projectId?: number; version?: number };

/**
 * プロジェクト更新確定ボタン。
 *
 * formData には Cookie 経由で projectId / version が含まれる。
 * 楽観ロック用の version を確実に API に送信するため、明示的に body へ展開する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/confirmOfUpdate.jsp
 * @see _references/nablarch-example-web/src/main/java/.../ProjectAction.java の update メソッド
 */
export function ConfirmUpdateButton({ projectId, formData }: { projectId: number; formData: CookieFormData }) {
  // Cookie から復元した formData に含まれる projectId / version を取り出す
  const { projectId: pid, version, ...rest } = formData;

  return (
    <ConfirmButton
      onConfirm={async () => {
        // projectId・version は OpenAPI スキーマ外のフィールドだが、
        // Nablarch の楽観ロック制御に必要なため明示的に含める
        await apiPost("/api/project/update", {
          ...rest,
          projectId: pid ?? projectId,
          version: version ?? 0,
        });
      }}
      redirectTo={`/projects/${projectId}/edit/complete`}
      errorMessage="更新に失敗しました。"
      loadingLabel="更新中..."
    />
  );
}
