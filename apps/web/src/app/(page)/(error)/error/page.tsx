import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "エラー画面" };

/**
 * エラー種別ごとのメタタイトルとメッセージ定義。
 *
 * - `message` は JSX（`<br />` を含む）で返す。
 * - `hasDynamicMessage` が指定されたエラー種別は `?message=` クエリで
 *   サーバーからの動的メッセージも併せて表示する。
 *   `"before"` = 動的メッセージを静的メッセージの前に表示（userError.jsp 相当）
 *   `"after"`  = 動的メッセージを静的メッセージの後に表示（optimisticLockError.jsp 相当）
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/errorPages/
 */
const ERROR_MESSAGES: Record<
  string,
  { title: string; message: ReactNode; hasDynamicMessage?: "before" | "after" }
> = {
  // — errorPages/doubleSubmissionError.jsp L26
  doubleSubmission: {
    title: "エラー画面",
    message: <>不正な画面遷移を検出したため、処理を中断しました。</>,
  },
  // — errorPages/optimisticLockError.jsp L25-28
  optimisticLock: {
    title: "エラー画面",
    message: (
      <>対象の情報は、他のユーザによって既に変更されているため操作を完了できませんでした。</>
    ),
    hasDynamicMessage: "after",
  },
  // — errorPages/pageNotFoundError.jsp L26
  notFound: {
    title: "エラー画面",
    message: <>指定されたページは存在しないか、既に削除されています。</>,
  },
  // — errorPages/permissionError.jsp L26
  permission: {
    title: "エラー画面",
    message: <>アクセス権限がありません。</>,
  },
  // — errorPages/requestEntityTooLarge.jsp L26
  tooLarge: {
    title: "エラー画面",
    message: <>アップロードファイルのサイズがシステム上限値を超過しました。</>,
  },
  // — errorPages/serviceUnavailableError.jsp L26
  unavailable: {
    title: "エラー画面",
    message: <>サービス提供時間外です。</>,
  },
  // — errorPages/tamperingDetected.jsp L26
  tampering: {
    title: "エラー画面",
    message: <>既にログアウトされています。ログイン後に処理を行ってください。</>,
  },
  // — errorPages/userError.jsp L25-29
  user: {
    title: "エラー画面",
    message: (
      <>
        処理を正常に終了することができませんでした。
        <br />
        お手数ですが、入力内容をご確認の上、少し間をおいてから、もう一度手順をやりなおして下さい。
        <br />
        状況が変わらない場合は、お手数ですが、このシステムの管理者にご連絡ください。
      </>
    ),
    hasDynamicMessage: "before",
  },
};

/**
 * デフォルトのエラー表示（種別不明時）。
 * — errorPages/error.jsp L26-27
 */
const DEFAULT_ERROR: { title: string; message: ReactNode } = {
  title: "エラー画面",
  message: (
    <>
      システムエラーが発生しました。
      <br />
      このシステムの管理者に連絡してください。
    </>
  ),
};

/**
 * 汎用エラーページ。
 *
 * クエリパラメータ `type` に応じたエラーメッセージを表示する。
 * 元の Nablarch では複数の JSP に分かれていたエラー画面を1ルートに統合。
 *
 * HTML 構造は原本 JSP に忠実:
 * ```
 * <div class="title-nav"><span class="page-title">エラー画面</span></div>
 * <div class="message-area"><p>...</p></div>
 * <div class="title-nav"></div>
 * ```
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/errorPages/
 */
export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; message?: string }>;
}) {
  const { type = "", message: dynamicMessage } = await searchParams;
  const errorDef = ERROR_MESSAGES[type] ?? DEFAULT_ERROR;
  const hasDynamic = "hasDynamicMessage" in errorDef ? errorDef.hasDynamicMessage : undefined;

  return (
    <>
      <div className="title-nav">
        <span className="page-title">エラー画面</span>
      </div>
      <div className="message-area">
        {/* userError.jsp: <n:errors> (dynamic) が静的メッセージの前 */}
        {hasDynamic === "before" && dynamicMessage && (
          <ul><li className="message-error">{dynamicMessage}</li></ul>
        )}
        <p>{errorDef.message}</p>
        {/* optimisticLockError.jsp: <n:errors> (dynamic) が静的メッセージの後 */}
        {hasDynamic === "after" && dynamicMessage && (
          <ul><li className="message-error">{dynamicMessage}</li></ul>
        )}
      </div>
      <div className="title-nav"></div>
    </>
  );
}
