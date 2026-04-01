"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from ":/app/(api)/_utils/client";

/**
 * ログアウトボタン。
 *
 * サーバーサイドのログアウト API を呼び出してから Cookie をクリアし /login に遷移する。
 * header.jsp の `<n:a href="/action/logout">ログアウト</n:a>` に相当。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/header.jsp — `<n:a href="/action/logout">`
 */
export function LogoutButton() {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      // サーバーサイドのセッション無効化
      await apiGet("/api/authentication/logout").catch(() => {
        // ログアウト API が失敗してもクライアント側の Cookie 削除は続行する
      });
      // Route Handler 経由で HttpOnly Cookie を削除
      // @see /src/app/api/auth/logout/route.ts
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  }, [router]);

  // @see header.jsp L68: 元は <n:a> タグ（リンク要素）。同等のスタイルで表示する
  return (
    <button
      type="button"
      className="btn btn-link p-0 text-decoration-underline"
      onClick={() => handleLogout()}
    >
      ログアウト
    </button>
  );
}
