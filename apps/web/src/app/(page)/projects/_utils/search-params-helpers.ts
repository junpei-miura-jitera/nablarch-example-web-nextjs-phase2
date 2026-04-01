/** searchParams の値を string[] に正規化する */
export function toArray(value: string | string[] | undefined): string[] | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value : [value];
}

/**
 * 現在の searchParams を維持したまま pageNumber だけ差し替えた URL を生成する。
 *
 * @param basePath - ページのベースパス（例: "/projects", "/projects/bulk"）
 * @param params   - 現在の searchParams
 * @param page     - 差し替えるページ番号
 */
/**
 * sideMenu.js と同様の日付パラメータを計算して /projects に遷移するための
 * URL を生成するヘルパー。
 *
 * sidemenu.jsp では期間リンクの href にフォームの既存検索条件（clientId, clientName,
 * projectName, projectType, projectClass, sortKey, sortDir）をすべて含めたうえで
 * sideMenu.js が日付パラメータを追記する。この関数は同等の振る舞いを再現する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/javascripts/sideMenu.js
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/sidemenu.jsp
 */
export function buildPeriodSearchUrl(
  type: "startThisYear" | "endThisYear" | "endLastYear",
  formRef: React.RefObject<HTMLFormElement | null>,
  basePath: `/${string}`,
  currentSearchParams: URLSearchParams,
): string {
  const thisYear = new Date().getFullYear();
  const thisYearStartDate = `${thisYear}0101`;
  const thisYearEndDate = `${thisYear}1231`;
  const lastYearEndDate = `${thisYear - 1}1231`;

  const params = new URLSearchParams();

  // フォームの現在値を引き継ぐ（sidemenu.jsp の <c:param> に対応）
  if (formRef.current) {
    const formData = new FormData(formRef.current);

    const carryOverKeys = [
      "clientId",
      "clientName",
      "projectName",
      "projectType",
      "sortKey",
      "sortDir",
    ] as const;

    for (const key of carryOverKeys) {
      const value = formData.get(key);
      if (typeof value === "string" && value !== "") {
        params.set(key, value);
      } else {
        // フォームに input がないキー（projectType 等）は searchParams から引き継ぐ
        const fallback = currentSearchParams.get(key);
        if (fallback) {
          params.set(key, fallback);
        }
      }
    }

    // projectClass は複数値
    const projectClassValues = formData.getAll("projectClass");
    for (const v of projectClassValues) {
      if (typeof v === "string" && v !== "") {
        params.append("projectClass", v);
      }
    }
  }

  // ページ番号はリセット
  params.set("pageNumber", "1");

  // 日付パラメータを追加
  if (type === "startThisYear") {
    params.set("projectStartDateBegin", thisYearStartDate);
    params.set("projectStartDateEnd", thisYearEndDate);
  } else if (type === "endThisYear") {
    params.set("projectEndDateBegin", thisYearStartDate);
    params.set("projectEndDateEnd", thisYearEndDate);
  } else if (type === "endLastYear") {
    params.set("projectEndDateEnd", lastYearEndDate);
  }

  return `${basePath}?${params.toString()}`;
}

export function buildPageUrl(
  basePath: `/${string}`,
  params: Record<string, string | string[]>,
  page: number,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) sp.append(key, v);
    } else {
      sp.set(key, value);
    }
  }
  sp.set("pageNumber", String(page));
  return `${basePath}?${sp.toString()}`;
}
