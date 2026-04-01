"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearProjectFormCookie } from "../_utils/cookie-helpers";

/**
 * 確認画面の確定ボタン共通コンポーネント。
 *
 * API 呼び出しは呼び出し元が型付きクライアントで行い、このコンポーネントは
 * ローディング状態・Cookie クリア・リダイレクトを共通化する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/confirmOfCreate.jsp — n:submit 要素
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/confirmOfUpdate.jsp — n:submit 要素
 */
export function ConfirmButton({
  onConfirm,
  redirectTo,
  errorMessage,
  label = "確定",
  loadingLabel = "処理中...",
}: {
  // API 呼び出し（エラー時は throw）
  onConfirm: () => Promise<void>;
  // 成功時のリダイレクト先
  redirectTo: string;
  // エラー時のメッセージ
  errorMessage: string;
  // ボタンラベル
  label?: string;
  // 処理中のラベル
  loadingLabel?: string;
}) {
  const router = useRouter();
  // — n:submit allowDoubleSubmission="false" に対応
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // @see ProjectAction.java L103: SessionUtil.delete → DB insert をアトミックに実行
  // クライアント側では API 成功を確認してから Cookie 削除 → リダイレクトを行う。
  // Cookie 削除と API 呼び出しを同一 Server Action に統合するのが理想だが、
  // Phase 1 ではクライアント側で順次実行する。
  async function handleConfirm() {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onConfirm();
      // API 成功後に Cookie を即座にクリアしてからリダイレクト
      await clearProjectFormCookie();
      router.push(redirectTo);
    } catch {
      setSubmitError(errorMessage);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {submitError && <span className="message-error">{submitError}</span>}
      <button
        type="button"
        className="btn btn-lg btn-success ms-2"
        onClick={handleConfirm}
        disabled={isSubmitting}
      >
        {isSubmitting ? loadingLabel : label}
      </button>
    </>
  );
}
