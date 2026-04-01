"use client";

import { useEffect } from "react";

/**
 * ページロード時に現在の URL を sessionStorage に保存する。
 *
 * 詳細画面や編集画面の「戻る」ボタン (BackButton) が
 * 検索条件付きの一覧 URL に戻れるようにするため。
 *
 * 元の JSP では saveListUrl() で同様の処理を行っていた。
 *
 * @see _references/nablarch-example-web/src/main/webapp/javascripts/projectList.js
 */
export function SaveListUrl() {
  useEffect(() => {
    sessionStorage.setItem("listUrl", window.location.pathname + window.location.search);
  }, []);

  return null;
}
