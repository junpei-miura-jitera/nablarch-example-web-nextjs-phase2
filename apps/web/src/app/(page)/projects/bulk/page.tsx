import type { Metadata } from "next";
import { apiGet } from ":/app/(api)/_utils/server";
import type { ProjectDto } from "../_schemas/project.types";

export const metadata: Metadata = { title: "プロジェクト検索一覧更新画面" };
import { BulkEditForm } from "./bulk-edit-form";
import { ProjectSidemenuLayout } from "../_layouts/project-sidemenu-layout";
import { Pagination } from "../_fragments/pagination";
import { SaveListUrl } from "../_fragments/save-list-url";
import { toArray, buildPageUrl } from "../_utils/search-params-helpers";
import type { ProjectClassValue } from "../_constants/project-class";

const PAGE_SIZE = 20;

/**
 * プロジェクト一括更新画面。
 *
 * 元 JSP と同様に searchParams から検索条件・ソート・ページを受け取り、
 * サーバーサイドで API に渡す。
 *
 * 現時点では MSW モックがページネーション非対応のため、
 * API が返す全件をサーバーサイドでスライスして擬似ページングを行う。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/projectBulk/update.jsp
 */
export default async function BulkUpdatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const sortKey = (params.sortKey as string | undefined) ?? "id";
  const sortDir = (params.sortDir as string | undefined) ?? "asc";
  const pageNumber = Number((params.pageNumber as string | undefined) ?? "1");

  let allProjects: ProjectDto[] = [];
  try {
    allProjects = await apiGet<ProjectDto[]>("/api/projectbulk/list", {
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
  } catch {
    allProjects = [];
  }

  // 擬似ページング（projects/page.tsx と同じ方式）
  // MSW が全件返すのでサーバーサイドでスライス。
  // バックエンド接続時はこのスライス処理を削除し、API レスポンスの
  // pagination オブジェクトから totalCount (resultCount) / pageCount を取得する。
  // @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectBulkAction.java#list
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                buildUrl={(page) => buildPageUrl("/projects/bulk", params, page)}
              />
              <BulkEditForm
                projects={projects}
                totalCount={totalCount}
                sortKey={sortKey}
                sortDir={sortDir}
              />
            </div>
          </div>
        </div>
      </div>
    </ProjectSidemenuLayout>
  );
}
