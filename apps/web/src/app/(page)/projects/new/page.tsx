import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CreateProjectForm } from "./create-project-form";
import { ProjectSidemenuLayout } from "../_layouts/project-sidemenu-layout";

export const metadata: Metadata = { title: "プロジェクト登録画面" };

/**
 * プロジェクト新規登録画面。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/create.jsp
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#newEntity (L50-55)
 */
export default async function CreateProjectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  // @see ProjectAction.java#newEntity: セッションから "project" を削除してから入力画面を表示
  // 確認画面から「戻る」でない場合（直接アクセス）は Cookie をクリアして前回データを残さない
  const isReturningFromConfirm = params.from === "confirm";
  if (!isReturningFromConfirm) {
    const cookieStore = await cookies();
    cookieStore.delete("project_form_data");
  }
  return <ProjectSidemenuLayout><CreateProjectForm /></ProjectSidemenuLayout>;
}
