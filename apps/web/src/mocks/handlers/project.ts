/**
 * プロジェクト CRUD の MSW ハンドラー。
 *
 * 全操作は store (インメモリデータストア) を使い、セッション中で永続化される。
 * - Create flow: newEntity -> confirmOfCreate -> create -> completeOfCreate
 * - Edit flow: show -> edit -> confirmOfUpdate -> update -> completeOfUpdate
 * - Delete flow: delete -> completeOfDelete
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java
 */
import { HttpResponse, http } from "msw";
import { store, extractSearchParams } from "../store";
import type { ProjectFormRequest } from ":/app/(page)/projects/_schemas/project.types";
import type { MutableProjectDto } from "../fixtures/projects";

/**
 * CSV 出力用のコンテンツを生成する。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#download
 */
function buildCsv(projects: MutableProjectDto[]): string {
  const header =
    "プロジェクトID,プロジェクト名,プロジェクト種別,プロジェクト分類,プロジェクトマネージャー,プロジェクトリーダー,顧客ID,顧客名,プロジェクト開始日,プロジェクト終了日,備考,売上高,売上原価,販管費,本社配賦";
  const rows = projects.map(
    (p) =>
      [
        p.projectId,
        `"${p.projectName}"`,
        p.projectType,
        p.projectClass,
        `"${p.projectManager}"`,
        `"${p.projectLeader}"`,
        p.clientId,
        `"${p.clientName}"`,
        p.projectStartDate,
        p.projectEndDate,
        `"${p.note}"`,
        p.sales,
        p.costOfGoodsSold,
        p.sga,
        p.allocationOfCorpExpenses,
      ].join(","),
  );
  return [header, ...rows].join("\n");
}

export const projectHandlers = [
  // ── List / Search ───────────────────────────────────────

  /**
   * プロジェクト一覧画面初期表示。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#index
   * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/index.jsp
   */
  http.get("/api/project/index", () => {
    return HttpResponse.json(undefined, { status: 200 });
  }),

  /**
   * プロジェクト一覧検索。
   *
   * サイドメニューの検索条件 + ソート + ページネーションでプロジェクト一覧を取得する。
   * 元の Nablarch 実装ではサーバーサイドページングだが、MSW では全件返し
   * クライアント側 (page.tsx) でスライスする。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#list
   * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/index.jsp
   */
  http.get("/api/project/list", ({ request }) => {
    const url = new URL(request.url);
    const params = extractSearchParams(url);
    const result = store.searchProjects(params);
    return HttpResponse.json(result);
  }),

  // ── Show / Edit ─────────────────────────────────────────

  /**
   * プロジェクト詳細表示。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#show
   * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/detail.jsp
   */
  http.get("/api/project/show", ({ request }) => {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get("projectId"));
    const project = store.getProject(id);

    if (!project) {
      return HttpResponse.json(
        { ok: false, message: "プロジェクトが見つかりません。" },
        { status: 404 },
      );
    }

    return HttpResponse.json(project);
  }),

  /**
   * プロジェクト編集画面の初期データ取得。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#edit
   * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/update.jsp
   */
  http.get("/api/project/edit", ({ request }) => {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get("projectId"));
    const project = store.getProject(id);

    if (!project) {
      return HttpResponse.json(
        { ok: false, message: "プロジェクトが見つかりません。" },
        { status: 404 },
      );
    }

    return HttpResponse.json(project);
  }),

  // ── Create flow ─────────────────────────────────────────

  /**
   * 新規登録画面の初期データ取得（空フォーム）。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#newEntity
   * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/create.jsp
   */
  http.get("/api/project/newEntity", () => {
    return HttpResponse.json(undefined, { status: 200 });
  }),

  /**
   * 新規登録確認。
   *
   * フォームのバリデーションを行い、確認画面に進む。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#confirmOfCreate
   * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/confirmOfCreate.jsp
   */
  http.post("/api/project/confirmOfCreate", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    if (
      !body.projectName ||
      !body.projectType ||
      !body.projectClass ||
      !body.clientId
    ) {
      return HttpResponse.json({
        ok: false,
        message: "必須項目が入力されていません。",
      });
    }

    return HttpResponse.json({ ok: true, message: "" });
  }),

  /**
   * 新規登録実行。ストアにプロジェクトを追加する。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#create
   */
  http.post("/api/project/create", async ({ request }) => {
    const body = (await request.json()) as ProjectFormRequest;
    store.addProject(body);
    return HttpResponse.json({ ok: true, message: "" });
  }),

  /**
   * 新規登録完了画面。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#completeOfCreate
   */
  http.get("/api/project/completeOfCreate", () => {
    return HttpResponse.json({ ok: true, message: "" });
  }),

  /**
   * 新規登録 -> 入力画面に戻る。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#backToNew
   */
  http.get("/api/project/backToNew", () => {
    return HttpResponse.json({ ok: true, message: "" });
  }),

  // ── Update flow ─────────────────────────────────────────

  /**
   * 更新確認。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#confirmOfUpdate
   * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/confirmOfUpdate.jsp
   */
  http.post("/api/project/confirmOfUpdate", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    if (
      !body.projectName ||
      !body.projectType ||
      !body.projectClass ||
      !body.clientId
    ) {
      return HttpResponse.json({
        ok: false,
        message: "必須項目が入力されていません。",
      });
    }

    return HttpResponse.json({ ok: true, message: "" });
  }),

  /**
   * 編集 -> 入力画面に戻る。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#backToEdit
   */
  http.get("/api/project/backToEdit", () => {
    return HttpResponse.json({ ok: true, message: "" });
  }),

  /**
   * 更新実行。ストア内のプロジェクトを更新する。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#update
   */
  http.post("/api/project/update", async ({ request }) => {
    const body = (await request.json()) as ProjectFormRequest & {
      projectId?: string | number;
    };
    const projectId = Number(body.projectId);

    if (!projectId) {
      return HttpResponse.json({
        ok: false,
        message: "プロジェクトIDが不正です。",
      });
    }

    const updated = store.updateProject(projectId, body);
    if (!updated) {
      return HttpResponse.json({
        ok: false,
        message: "プロジェクトが見つかりません。",
      });
    }

    return HttpResponse.json({ ok: true, message: "" });
  }),

  /**
   * 更新完了画面。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#completeOfUpdate
   */
  http.get("/api/project/completeOfUpdate", () => {
    return HttpResponse.json({ ok: true, message: "" });
  }),

  // ── Delete flow ─────────────────────────────────────────

  /**
   * プロジェクト削除実行。ストアからプロジェクトを削除する。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#delete
   */
  http.post("/api/project/delete", async ({ request }) => {
    const body = (await request.json()) as { projectId?: string | number };
    const projectId = Number(body.projectId);

    if (!projectId) {
      return HttpResponse.json({
        ok: false,
        message: "プロジェクトIDが不正です。",
      });
    }

    const deleted = store.deleteProject(projectId);
    if (!deleted) {
      return HttpResponse.json({
        ok: false,
        message: "プロジェクトが見つかりません。",
      });
    }

    return HttpResponse.json({ ok: true, message: "" });
  }),

  /**
   * 削除完了画面。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#completeOfDelete
   */
  http.get("/api/project/completeOfDelete", () => {
    return HttpResponse.json({ ok: true, message: "" });
  }),

  // ── Download ────────────────────────────────────────────

  /**
   * プロジェクトダウンロード (CSV)。
   *
   * 検索条件に一致するプロジェクトを CSV 形式で返す。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#download
   */
  http.get("/api/project/download", ({ request }) => {
    const url = new URL(request.url);
    const params = extractSearchParams(url);
    const result = store.searchProjects(params);
    const csv = buildCsv(result);

    return new HttpResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="projects.csv"',
      },
    });
  }),
];
