// header.jsp + menu.jsp の HTML 構造をそのまま React 化
import Link from "next/link";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, authUserSchema, type AuthUser } from ":/utils/auth";
import { LogoutButton } from "./logout-button";

/**
 * Cookie からログインユーザー情報を取得する。
 */
async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);
  if (!session?.value) return null;
  try {
    const parsed = authUserSchema.safeParse(JSON.parse(session.value));
    if (!parsed.success) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * ナビゲーションバー・ヘッダー・フッターを含むプロジェクトページの共通レイアウト。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/menu.jsp
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/header.jsp
 */
export async function ProjectHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  return (
    <>
      {/* mainContents: menu.jsp + header.jsp */}
      <div className="mainContents">
        {/* menu.jsp: navbar */}
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
                  {/* menu.jsp: <c:if test="${userContext.admin}"> */}
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

        {/* header.jsp: headerArea */}
        <div className="headerArea my-4">
          <span className="headerLeftPane">
            <span className="headerElement applicationName">
              プロジェクト管理システム
            </span>
          </span>
          <span className="headerCenterPane" />
          <span className="headerRightPane">
            {user ? (
              <>
                <span className="headerElement">
                  ログイン中：&nbsp;{user.kanjiName}
                </span>
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
    </>
  );
}
