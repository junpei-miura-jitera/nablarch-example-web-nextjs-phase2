/**
 * 顧客・業種関連の MSW ハンドラー。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ClientAction.java
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/IndustryAction.java
 */
import { HttpResponse, http } from "msw";
import { store } from "../store";

export const clientHandlers = [
  /**
   * 顧客検索。
   *
   * clientName パラメータで部分一致検索。industryCode で業種フィルタ。
   * sortKey (id | name) と sortDir (asc | desc) でソート。
   * クライアント検索モーダルで使用。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ClientAction.java#find
   * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/client/index.jsp
   */
  http.get("/api/client/find", ({ request }) => {
    const url = new URL(request.url);
    const clientName = url.searchParams.get("clientName") ?? "";
    const industryCode = url.searchParams.get("industryCode") ?? "";
    const sortKey = url.searchParams.get("sortKey") ?? "id";
    const sortDir = url.searchParams.get("sortDir") ?? "asc";

    let results = [...store.getClients()];

    if (clientName) {
      results = results.filter((c) => c.clientName.includes(clientName));
    }
    if (industryCode) {
      results = results.filter((c) => c.industryCode === industryCode);
    }

    results.sort((a, b) => {
      const asc = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") {
        return a.clientName.localeCompare(b.clientName, "ja") * asc;
      }
      return ((a.clientId ?? 0) - (b.clientId ?? 0)) * asc;
    });

    return HttpResponse.json(results);
  }),

  /**
   * 業種一覧取得。
   *
   * industryCode / industryName でオプショナルフィルタ。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/IndustryAction.java#find
   */
  http.get("/api/industry/find", ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("industryCode") ?? "";
    const name = url.searchParams.get("industryName") ?? "";

    let results = [...store.getIndustries()];

    if (code) {
      results = results.filter((i) => i.industryCode === code);
    }
    if (name) {
      results = results.filter((i) => i.industryName.includes(name));
    }

    return HttpResponse.json(results);
  }),
];
