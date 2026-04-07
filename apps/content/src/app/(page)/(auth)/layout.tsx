/**
 * 認証系ページ共通レイアウト。
 *
 * Header.jsp (navbar なし) + footer.jsp の構造を再現する。 ログインページでは menu.jsp を含まず、headerArea のみ表示する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/header.jsp
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/footer.jsp
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mainContents">
      {/* header.jsp: headerArea (menu.jsp なし) */}
      <div className="headerArea my-4">
        <span className="headerLeftPane">
          <span className="headerElement applicationName">プロジェクト管理システム</span>
        </span>
        <span className="headerCenterPane" />
        <span className="headerRightPane">
          <span className="headerElement">
            <a href="/login">ログイン</a>
          </span>
        </span>
      </div>
      <hr className="floatClear" />

      {children}

      {/* footer.jsp */}
      <hr />
      <table className="w-100">
        <tbody>
          <tr>
            <td className="text-end">TIS株式会社</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
