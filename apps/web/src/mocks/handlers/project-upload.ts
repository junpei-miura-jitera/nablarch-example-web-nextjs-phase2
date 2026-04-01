/**
 * プロジェクト CSV アップロードの MSW ハンドラー。
 *
 * Upload flow: index -> upload (multipart/form-data or JSON) -> complete
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectUploadAction.java
 */
import { HttpResponse, http } from "msw";
import { store } from "../store";
import type { ProjectFormRequest } from ":/app/(page)/projects/_schemas/project.types";

export const projectUploadHandlers = [
  /**
   * アップロード画面初期表示。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectUploadAction.java#index
   * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/projectUpload/index.jsp
   */
  http.get("/api/projectupload/index", () => {
    return HttpResponse.json(undefined, { status: 200 });
  }),

  /**
   * CSV ファイルアップロードによるプロジェクト一括登録。
   *
   * multipart/form-data で送られた CSV を解析し、ストアに登録する。
   * テスト用に application/json パスもサポート。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectUploadAction.java#upload
   */
  http.post("/api/projectupload/upload", async ({ request }) => {
    const contentType = request.headers.get("content-type") ?? "";

    // JSON パス (テスト用の簡易パス)
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { projectList?: ProjectFormRequest[] };
      if (!body.projectList || body.projectList.length === 0) {
        return HttpResponse.json({
          ok: false,
          message: "アップロードするデータがありません。",
        });
      }
      const { created } = store.uploadProjects(body.projectList);
      return HttpResponse.json({
        ok: true,
        message: `${created}件のプロジェクトを登録しました。`,
      });
    }

    // multipart/form-data パス
    try {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file || !(file instanceof File)) {
        return HttpResponse.json({
          ok: false,
          message: "ファイルが指定されていません。",
        });
      }

      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      // ヘッダー行をスキップ
      const dataLines = lines.slice(1);

      const rows: ProjectFormRequest[] = dataLines.map((line) => {
        const cols = line.split(",");
        return {
          projectName: cols[0]?.trim() ?? "",
          projectType: (cols[1]?.trim() ?? "development") as
            | "development"
            | "maintenance",
          projectClass: (cols[2]?.trim() ?? "d") as
            | "ss"
            | "s"
            | "a"
            | "b"
            | "c"
            | "d",
          projectManager: cols[3]?.trim(),
          projectLeader: cols[4]?.trim(),
          clientId: cols[5]?.trim() ?? "1",
          clientName: cols[6]?.trim(),
          projectStartDate: cols[7]?.trim(),
          projectEndDate: cols[8]?.trim(),
          note: cols[9]?.trim(),
          sales: cols[10]?.trim(),
          costOfGoodsSold: cols[11]?.trim(),
          sga: cols[12]?.trim(),
          allocationOfCorpExpenses: cols[13]?.trim(),
        };
      });

      const { created } = store.uploadProjects(rows);
      return HttpResponse.json({
        ok: true,
        message: `${created}件のプロジェクトを登録しました。`,
      });
    } catch {
      return HttpResponse.json({
        ok: false,
        message: "ファイルの解析に失敗しました。",
      });
    }
  }),
];
