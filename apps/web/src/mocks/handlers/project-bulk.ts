/**
 * プロジェクト一括更新の MSW ハンドラー。
 *
 * Bulk update flow: list -> confirmOfUpdate -> update -> completeOfUpdate
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectBulkAction.java
 */
import { HttpResponse, http } from "msw";
import { store, extractSearchParams } from "../store";
import type { InnerProjectFormRequest } from ":/app/(page)/projects/_schemas/project.types";

export const projectBulkHandlers = [
  /**
   * 一括更新画面初期表示。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectBulkAction.java#index
   */
  http.get("/api/projectbulk/index", () => {
    return HttpResponse.json(undefined, { status: 200 });
  }),

  /**
   * 一括更新画面の初期化。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectBulkAction.java#initialize
   */
  http.get("/api/projectbulk/initialize", () => {
    return HttpResponse.json(undefined, { status: 200 });
  }),

  /**
   * 一括更新対象のプロジェクト一覧取得。
   *
   * 検索・フィルタ・ソートはストアの searchProjects を使用。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectBulkAction.java#list
   */
  http.get("/api/projectbulk/list", ({ request }) => {
    const url = new URL(request.url);
    const params = extractSearchParams(url);
    const result = store.searchProjects(params);
    return HttpResponse.json(result);
  }),

  /**
   * 一括更新確認。
   *
   * projectList のバリデーションを行い、確認画面に進む。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectBulkAction.java#confirmOfUpdate
   */
  http.post("/api/projectbulk/confirmOfUpdate", async ({ request }) => {
    const body = (await request.json()) as { projectList?: InnerProjectFormRequest[] };

    if (!body.projectList || body.projectList.length === 0) {
      return HttpResponse.json({
        ok: false,
        message: "更新対象が選択されていません。",
      });
    }

    return HttpResponse.json({ ok: true, message: "" });
  }),

  /**
   * 一括更新 -> 一覧に戻る。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectBulkAction.java#backToList
   */
  http.get("/api/projectbulk/backToList", () => {
    return HttpResponse.json({ ok: true, message: "" });
  }),

  /**
   * 一括更新実行。ストア内のプロジェクトを一括更新する。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectBulkAction.java#update
   */
  http.post("/api/projectbulk/update", async ({ request }) => {
    const body = (await request.json()) as { projectList?: InnerProjectFormRequest[] };

    if (!body.projectList || body.projectList.length === 0) {
      return HttpResponse.json({
        ok: false,
        message: "更新対象が選択されていません。",
      });
    }

    const { updated, failed } = store.bulkUpdateProjects(body.projectList);

    if (failed > 0) {
      return HttpResponse.json({
        ok: false,
        message: `${updated}件更新、${failed}件失敗しました。`,
      });
    }

    return HttpResponse.json({ ok: true, message: "" });
  }),

  /**
   * 一括更新完了画面。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectBulkAction.java#completeOfUpdate
   */
  http.get("/api/projectbulk/completeOfUpdate", () => {
    return HttpResponse.json({ ok: true, message: "" });
  }),
];
