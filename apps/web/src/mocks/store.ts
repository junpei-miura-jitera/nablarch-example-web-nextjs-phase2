/**
 * MSW ハンドラー用のインメモリデータストア。
 *
 * セッション中の CRUD 操作を保持し、サーバー再起動でリセットされる。
 * テストでは store.reset() を呼び出して初期状態に戻せる。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/AuthenticationAction.java
 */
import type { ProjectFormRequest, InnerProjectFormRequest } from ":/app/(page)/projects/_schemas/project.types";
import { projectFixtures, type MutableProjectDto } from "./fixtures/projects";
import { clientFixtures, type ClientDto } from "./fixtures/clients";
import { industryFixtures } from "./fixtures/industries";
import {
  userFixtures,
  validCredentials,
  type LoginUserPrincipal,
} from "./fixtures/users";

// ---------------------------------------------------------------------------
// Internal mutable state
// ---------------------------------------------------------------------------

let projects: MutableProjectDto[] = structuredClone(
  projectFixtures as unknown as MutableProjectDto[],
);
let nextProjectId =
  Math.max(...projectFixtures.map((p) => p.projectId)) + 1;
let authenticatedUser: LoginUserPrincipal | null = null;

// ---------------------------------------------------------------------------
// Helper: resolve clientName from clientId
// ---------------------------------------------------------------------------

function resolveClientName(clientId: number): string {
  return (
    clientFixtures.find((c) => c.clientId === clientId)?.clientName ?? ""
  );
}

// ---------------------------------------------------------------------------
// Helper: convert form string values to ProjectDto number values
// ---------------------------------------------------------------------------

function formToDto(
  form: ProjectFormRequest,
  extra: { projectId: number; userId: number; version: number },
): MutableProjectDto {
  const clientId = Number(form.clientId);
  return {
    projectId: extra.projectId,
    projectName: form.projectName,
    projectType: form.projectType as MutableProjectDto["projectType"],
    projectClass: form.projectClass as MutableProjectDto["projectClass"],
    projectStartDate: form.projectStartDate ?? "",
    projectEndDate: form.projectEndDate ?? "",
    clientId,
    clientName: form.clientName ?? resolveClientName(clientId),
    projectManager: form.projectManager ?? "",
    projectLeader: form.projectLeader ?? "",
    userId: extra.userId,
    note: form.note ?? "",
    sales: form.sales ? Number(form.sales) : 0,
    costOfGoodsSold: form.costOfGoodsSold ? Number(form.costOfGoodsSold) : 0,
    sga: form.sga ? Number(form.sga) : 0,
    allocationOfCorpExpenses: form.allocationOfCorpExpenses
      ? Number(form.allocationOfCorpExpenses)
      : 0,
    version: extra.version,
  };
}

// ---------------------------------------------------------------------------
// Search / sort / pagination
// ---------------------------------------------------------------------------

/**
 * プロジェクトの検索条件を表す型。
 * ProjectSearchForm のクエリパラメータ (string) を受け取る。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#list
 */
export type SearchParams = {
  pageNumber?: string;
  clientId?: string;
  clientName?: string;
  projectName?: string;
  projectType?: string;
  projectClass?: string[];
  projectStartDateBegin?: string;
  projectStartDateEnd?: string;
  projectEndDateBegin?: string;
  projectEndDateEnd?: string;
  sortKey?: string;
  sortDir?: string;
};

/**
 * 検索パラメータを URL の URLSearchParams から抽出する。
 */
export function extractSearchParams(url: URL): SearchParams {
  const get = (key: string) => url.searchParams.get(key) ?? undefined;
  const getAll = (key: string) => {
    const values = url.searchParams.getAll(key);
    return values.length > 0 ? values : undefined;
  };

  return {
    pageNumber: get("pageNumber"),
    clientId: get("clientId"),
    clientName: get("clientName"),
    projectName: get("projectName"),
    projectType: get("projectType"),
    projectClass: getAll("projectClass"),
    projectStartDateBegin: get("projectStartDateBegin"),
    projectStartDateEnd: get("projectStartDateEnd"),
    projectEndDateBegin: get("projectEndDateBegin"),
    projectEndDateEnd: get("projectEndDateEnd"),
    sortKey: get("sortKey"),
    sortDir: get("sortDir"),
  };
}

/**
 * ソートキーの文字列を ProjectDto のプロパティ名にマッピングする。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/common/code/ProjectSortKey.java
 */
function sortKeyToProperty(
  sortKey: string | undefined,
): keyof MutableProjectDto {
  switch (sortKey) {
    case "id":
      return "projectId";
    case "name":
      return "projectName";
    case "startDate":
      return "projectStartDate";
    case "endDate":
      return "projectEndDate";
    default:
      return "projectId";
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const store = {
  // ── Auth ──────────────────────────────────────────────

  /**
   * ログイン処理。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/AuthenticationAction.java#login
   */
  login(loginId: string, userPassword: string): LoginUserPrincipal | null {
    const match = validCredentials.find(
      (c) => c.loginId === loginId && c.userPassword === userPassword,
    );
    if (!match) return null;
    // loginId "10000001" → admin, "10000002" → member
    const user =
      match.loginId === "10000001"
        ? userFixtures.admin
        : userFixtures.member;
    authenticatedUser = user;
    return user;
  },

  /**
   * ログアウト処理。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/AuthenticationAction.java#logout
   */
  logout(): void {
    authenticatedUser = null;
  },

  /**
   * 現在のログインユーザーを取得。
   */
  getAuthenticatedUser(): LoginUserPrincipal | null {
    return authenticatedUser;
  },

  // ── Client ────────────────────────────────────────────

  /**
   * 顧客一覧取得。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ClientAction.java#find
   */
  getClients(): readonly ClientDto[] {
    return clientFixtures;
  },

  /**
   * 顧客名で部分一致検索。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ClientAction.java#find
   */
  searchClients(clientName?: string): readonly ClientDto[] {
    if (!clientName) return clientFixtures;
    return clientFixtures.filter((c) => c.clientName.includes(clientName));
  },

  // ── Industry ──────────────────────────────────────────

  /**
   * 業種一覧取得。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/IndustryAction.java#find
   */
  getIndustries() {
    return industryFixtures;
  },

  // ── Project CRUD ──────────────────────────────────────

  /**
   * プロジェクト全件取得。
   */
  getProjects(): MutableProjectDto[] {
    return projects;
  },

  /**
   * プロジェクト1件取得。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#show
   */
  getProject(id: number): MutableProjectDto | undefined {
    return projects.find((p) => p.projectId === id);
  },

  /**
   * プロジェクト新規登録。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#create
   */
  addProject(form: ProjectFormRequest): MutableProjectDto {
    const project = formToDto(form, {
      projectId: nextProjectId++,
      userId: authenticatedUser?.userId ?? 105,
      version: 1,
    });
    projects = [...projects, project];
    return project;
  },

  /**
   * プロジェクト更新。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#update
   */
  updateProject(
    id: number,
    form: ProjectFormRequest,
  ): MutableProjectDto | null {
    const idx = projects.findIndex((p) => p.projectId === id);
    if (idx === -1) return null;
    const existing = projects[idx];
    const updated = formToDto(form, {
      projectId: id,
      userId: existing.userId,
      version: (existing.version ?? 0) + 1,
    });
    projects = projects.map((p, i) => (i === idx ? updated : p));
    return updated;
  },

  /**
   * プロジェクト削除。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#delete
   */
  deleteProject(id: number): boolean {
    const idx = projects.findIndex((p) => p.projectId === id);
    if (idx === -1) return false;
    projects = projects.filter((_, i) => i !== idx);
    return true;
  },

  /**
   * プロジェクト検索。
   *
   * サイドメニューの検索条件 + ソート + ページネーションでフィルタリングする。
   * Nablarch の UniversalDao#findAllBySqlFile 相当の動作を再現。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#list
   * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/index.jsp
   */
  searchProjects(params: SearchParams): MutableProjectDto[] {
    let result = [...projects];

    // -- Filter: projectName (部分一致)
    if (params.projectName) {
      const name = params.projectName;
      result = result.filter((p) => p.projectName.includes(name));
    }

    // -- Filter: projectType (完全一致)
    if (params.projectType) {
      const type = params.projectType;
      result = result.filter((p) => p.projectType === type);
    }

    // -- Filter: projectClass (いずれかに一致)
    if (params.projectClass && params.projectClass.length > 0) {
      const classes = params.projectClass;
      result = result.filter(
        (p) => p.projectClass !== undefined && classes.includes(p.projectClass),
      );
    }

    // -- Filter: clientId (完全一致)
    if (params.clientId) {
      const clientId = Number(params.clientId);
      if (!Number.isNaN(clientId)) {
        result = result.filter((p) => p.clientId === clientId);
      }
    }

    // -- Filter: clientName (部分一致)
    if (params.clientName) {
      const clientName = params.clientName;
      result = result.filter(
        (p) => p.clientName !== undefined && p.clientName.includes(clientName),
      );
    }

    // -- Filter: projectStartDate range
    if (params.projectStartDateBegin) {
      const begin = params.projectStartDateBegin;
      result = result.filter(
        (p) => p.projectStartDate !== undefined && p.projectStartDate >= begin,
      );
    }
    if (params.projectStartDateEnd) {
      const end = params.projectStartDateEnd;
      result = result.filter(
        (p) => p.projectStartDate !== undefined && p.projectStartDate <= end,
      );
    }

    // -- Filter: projectEndDate range
    if (params.projectEndDateBegin) {
      const begin = params.projectEndDateBegin;
      result = result.filter(
        (p) => p.projectEndDate !== undefined && p.projectEndDate >= begin,
      );
    }
    if (params.projectEndDateEnd) {
      const end = params.projectEndDateEnd;
      result = result.filter(
        (p) => p.projectEndDate !== undefined && p.projectEndDate <= end,
      );
    }

    // -- Sort
    const prop = sortKeyToProperty(params.sortKey);
    const dir = params.sortDir === "desc" ? -1 : 1;
    result.sort((a, b) => {
      const va = a[prop];
      const vb = b[prop];
      if (va === vb) return 0;
      if (va === undefined || va === null) return 1;
      if (vb === undefined || vb === null) return -1;
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * dir;
      }
      return String(va).localeCompare(String(vb), "ja") * dir;
    });

    return result;
  },

  /**
   * プロジェクト一括更新。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectBulkAction.java#update
   */
  bulkUpdateProjects(
    projectList: InnerProjectFormRequest[],
  ): { updated: number; failed: number } {
    let updated = 0;
    let failed = 0;

    for (const item of projectList) {
      const id = Number(item.projectId);
      const idx = projects.findIndex((p) => p.projectId === id);
      if (idx === -1) {
        failed++;
        continue;
      }
      const existing = projects[idx];
      const merged: MutableProjectDto = {
        ...existing,
        projectName: item.projectName,
        projectType: item.projectType as MutableProjectDto["projectType"],
        projectStartDate: item.projectStartDate ?? existing.projectStartDate,
        projectEndDate: item.projectEndDate ?? existing.projectEndDate,
        version: (existing.version ?? 0) + 1,
      };
      projects = projects.map((p, i) => (i === idx ? merged : p));
      updated++;
    }

    return { updated, failed };
  },

  /**
   * CSV アップロードによるプロジェクト一括登録。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectUploadAction.java#upload
   */
  uploadProjects(
    rows: ProjectFormRequest[],
  ): { created: number } {
    let created = 0;
    for (const form of rows) {
      store.addProject(form);
      created++;
    }
    return { created };
  },

  // ── Reset ─────────────────────────────────────────────

  /**
   * ストアを初期状態にリセットする。テストの setUp で使用。
   */
  reset(): void {
    projects = structuredClone(
      projectFixtures as unknown as MutableProjectDto[],
    );
    nextProjectId =
      Math.max(...projectFixtures.map((p) => p.projectId)) + 1;
    authenticatedUser = null;
  },
};
