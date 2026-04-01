import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from ":/app/(api)/_utils/server";

export const metadata: Metadata = { title: "プロジェクト検索一覧画面" };
import type { ProjectDto } from "./_schemas/project.types";
import { PROJECT_TYPE } from "./_constants/project-type";
import { ProjectSidemenuLayout } from "./_layouts/project-sidemenu-layout";
import { SortSelect } from "./_fragments/sort-select";
import { DownloadButton } from "./_fragments/download-button";
import { Pagination } from "./_fragments/pagination";
import { SaveListUrl } from "./_fragments/save-list-url";
import { formatDate } from "./_utils/format-date";
import { toArray, buildPageUrl } from "./_utils/search-params-helpers";
import type { ProjectClassValue } from "./_constants/project-class";

/**
 * プロジェクト検索一覧ページ。
 *
 * 元の Java 版と同様に、ソート条件・ページ番号は URL クエリパラメータで
 * サーバーサイドに渡し、サーバーがソート済みの結果を返す。
 *
 * 現時点では MSW モックがページネーション非対応のため、
 * API が返す全件をサーバーサイドでスライスして擬似ページングを行う。
 * バックエンド接続時にスライス処理を削除すれば本来のサーバーサイドページングに切り替わる。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/index.jsp
 */

const PAGE_SIZE = 20;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const sortKey = (params.sortKey as string | undefined) ?? "id";
  const sortDir = (params.sortDir as string | undefined) ?? "asc";
  const pageNumber = Number((params.pageNumber as string | undefined) ?? "1");

  const data = await apiGet<ProjectDto[]>("/api/project/list", {
    pageNumber: String(pageNumber),
    sortKey,
    sortDir,
    clientId: params.clientId as string | undefined,
    clientName: params.clientName as string | undefined,
    projectName: params.projectName as string | undefined,
    projectType: params.projectType as "development" | "maintenance" | undefined,
    projectClass: toArray(params.projectClass) as ProjectClassValue[] | undefined,
    projectStartDateBegin: params.projectStartDateBegin as string | undefined,
    projectStartDateEnd: params.projectStartDateEnd as string | undefined,
    projectEndDateBegin: params.projectEndDateBegin as string | undefined,
    projectEndDateEnd: params.projectEndDateEnd as string | undefined,
  });

  // 元 JSP の <c:if test="${searchResult != null}"> に対応:
  // 検索パラメータがない初期表示時は検索結果を非表示にする
  const hasSearchParams = Object.keys(params).length > 0;

  const allProjects: ProjectDto[] = data ?? [];

  // 擬似ページング: MSW が全件返すのでサーバーサイドでスライス。
  // 本来は Nablarch の UniversalDao#findAllBySqlFile が
  // SqlResultSet（pagination 付き）を返し、Action がそのまま JSP に渡す。
  // バックエンド接続時はこのスライス処理を削除し、API レスポンスの
  // pagination オブジェクトから totalCount/pageCount を取得する。
  // @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#list
  const totalCount = allProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const projects = allProjects.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <ProjectSidemenuLayout>
      <SaveListUrl />
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              {/* title-nav */}
              <div className="title-nav">
                <span>プロジェクト検索一覧画面</span>
                <div className="button-nav">
                  <Link
                    href="/projects/new"
                    className="btn btn-lg btn-light"
                  >
                    新規登録
                  </Link>
                </div>
              </div>

              {/* n:errors filter="global" に対応するグローバルエラーメッセージ表示領域 */}
              <div className="message-area margin-top"></div>

              {hasSearchParams && (
                <>
                  {/* sort-nav */}
                  <div className="sort-nav mb-3">
                    <div style={{ float: "left" }}>
                      <span className="font-group">検索結果</span>
                      <span className="search-result-count">
                        {totalCount}
                      </span>
                      <DownloadButton searchParams={params} />
                    </div>
                    <SortSelect sortKey={sortKey} sortDir={sortDir} />
                  </div>

                  {/* ページネーション（テーブル上部） */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    buildUrl={(page) => buildPageUrl("/projects", params, page)}
                  />

                  {/* 検索結果テーブル */}
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>プロジェクトID</th>
                        <th>プロジェクト名</th>
                        <th>プロジェクト種別</th>
                        <th>開始日</th>
                        <th>終了日</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p) => (
                        <tr key={p.projectId} className="info">
                          <td>
                            <Link href={`/projects/${p.projectId}`}>
                              {p.projectId}
                            </Link>
                          </td>
                          <td>{p.projectName}</td>
                          <td>
                            {PROJECT_TYPE[
                              p.projectType as keyof typeof PROJECT_TYPE
                            ] ?? p.projectType}
                          </td>
                          <td>{formatDate(p.projectStartDate)}</td>
                          <td>{formatDate(p.projectEndDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* page-footer */}
              <div className="title-nav page-footer">
                <div className="button-nav">
                  <Link
                    href="/projects/new"
                    className="btn btn-lg btn-light"
                  >
                    新規登録
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProjectSidemenuLayout>
  );
}
