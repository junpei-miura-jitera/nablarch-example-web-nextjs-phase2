import Link from 'next/link'
import { LogoutButton } from './logout-button'
import { getAuthUserServer } from '../../_utils/auth-user.server'

/**
 * menu.jsp + header.jsp をそのまま React 化したヘッダー部品。
 * children を抱えず、各 page が必要な順序で明示配置する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/menu.jsp
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/header.jsp
 */
export async function LayoutHeader() {
  const user = await getAuthUserServer()

  return (
    <div className="mainContents">
      <div>
        <nav className="navbar navbar-expand-md p-3" data-bs-theme="dark">
          <div className="container-fluid">
            <span className="navbar-brand px-2 fs-4">Project</span>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarContent"
              aria-controls="navbarContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarContent">
              <ul className="navbar-nav me-auto">
                <li className="nav-item px-2">
                  <Link href="/projects" className="nav-link">
                    プロジェクト検索
                  </Link>
                </li>
                <li className="nav-item px-2">
                  <Link href="/projects/bulk" className="nav-link">
                    プロジェクト一括更新
                  </Link>
                </li>
                {user?.admin && (
                  <li className="nav-item px-2">
                    <Link href="/projects/upload" className="nav-link">
                      プロジェクト一括登録
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </div>

      <div className="headerArea my-4">
        <span className="headerLeftPane">
          <span className="headerElement applicationName">プロジェクト管理システム</span>
        </span>
        <span className="headerCenterPane" />
        <span className="headerRightPane">
          {user ? (
            <>
              <span className="headerElement">ログイン中：&nbsp;{user.kanjiName}</span>
              <span className="headerElement">
                <LogoutButton />
              </span>
            </>
          ) : (
            <span className="headerElement">
              <Link href="/login">ログイン</Link>
            </span>
          )}
        </span>
      </div>
      <hr className="floatClear" />
    </div>
  )
}
