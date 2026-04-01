"use client";

import { useRouter } from "next/navigation";

const LIST_URL_KEY = "listUrl";

/**
 * 検索条件付き一覧画面に戻るボタン。
 *
 * sessionStorage に保存された一覧 URL（検索条件付き）に遷移する。
 * 保存がなければ /projects にフォールバックする。
 *
 * 元の JSP では saveListUrl() / setListUrlTo() で sessionStorage を使っていた。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/detail.jsp
 * @see _references/nablarch-example-web/src/main/webapp/javascripts/projectList.js
 */
export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  const fallback = "/projects";

  const getListUrl = () => {
    const raw = sessionStorage.getItem(LIST_URL_KEY);
    if (!raw) return fallback;
    try {
      // open redirect 防止: 相対パスのみ許可。絶対 URL が保存されていた場合は pathname + search を抽出する
      return raw.startsWith("/") && !raw.startsWith("//")
        ? raw
        : new URL(raw).pathname + new URL(raw).search;
    } catch {
      return fallback;
    }
  };

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(getListUrl());
  };

  return (
    <a href={fallback} className={className} onClick={handleBack}>
      戻る
    </a>
  );
}
