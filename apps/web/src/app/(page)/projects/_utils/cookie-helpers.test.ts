/**
 * Cookie ヘルパーのユニットテスト。
 *
 * cookie-helpers.ts は Route Handler（/api/form-cookie）経由で
 * HttpOnly Cookie を操作する。テストでは fetch をモックして
 * Route Handler のレスポンスを模倣する。
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// fetch モック用のインメモリストア
let store: Record<string, unknown> | null = null;

beforeEach(() => {
  store = null;

  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";

    if (url === "/api/form-cookie" && method === "POST") {
      store = JSON.parse(init?.body as string);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (url === "/api/form-cookie" && method === "GET") {
      return new Response(JSON.stringify(store), { status: 200 });
    }

    if (url === "/api/form-cookie" && method === "DELETE") {
      store = null;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  }));
});

describe("cookie-helpers", () => {
  it("saves and loads form data", async () => {
    const { saveProjectFormToCookie, loadProjectFormFromCookie } = await import("./cookie-helpers");
    const data = { projectName: "テスト", sales: 1000 };
    await saveProjectFormToCookie(data);
    const loaded = await loadProjectFormFromCookie();
    expect(loaded).toEqual(data);
  });

  it("returns null when no cookie", async () => {
    const { loadProjectFormFromCookie } = await import("./cookie-helpers");
    const loaded = await loadProjectFormFromCookie();
    expect(loaded).toBeNull();
  });

  it("clears cookie", async () => {
    const { saveProjectFormToCookie, clearProjectFormCookie, loadProjectFormFromCookie } = await import("./cookie-helpers");
    await saveProjectFormToCookie({ test: true });
    await clearProjectFormCookie();
    const loaded = await loadProjectFormFromCookie();
    expect(loaded).toBeNull();
  });
});
