/**
 * API ルート定数と、各エンドポイントのリクエスト / レスポンス型定義。
 *
 * OpenAPI spec (openapi.yml) をもとに手書き。
 * 実際にアプリで使われているエンドポイントのみ定義する。
 */

// ---------------------------------------------------------------------------
// Route constants
// ---------------------------------------------------------------------------

export const API_ROUTES = {
  // Authentication
  AUTH_LOGIN: "/api/authentication/login",
  AUTH_LOGOUT: "/api/authentication/logout",

  // Client
  CLIENT_FIND: "/api/client/find",

  // Industry
  INDUSTRY_FIND: "/api/industry/find",

  // Project CRUD
  PROJECT_LIST: "/api/project/list",
  PROJECT_SHOW: "/api/project/show",
  PROJECT_EDIT: "/api/project/edit",
  PROJECT_CREATE: "/api/project/create",
  PROJECT_UPDATE: "/api/project/update",
  PROJECT_DELETE: "/api/project/delete",
  PROJECT_DOWNLOAD: "/api/project/download",

  // Project Bulk
  PROJECT_BULK_LIST: "/api/projectbulk/list",
  PROJECT_BULK_UPDATE: "/api/projectbulk/update",

  // Project Upload
  PROJECT_UPLOAD: "/api/projectupload/upload",
} as const;

// ---------------------------------------------------------------------------
// Enum types
// ---------------------------------------------------------------------------

export type ProjectType = "development" | "maintenance";
export type ProjectClass = "ss" | "s" | "a" | "b" | "c" | "d";

// ---------------------------------------------------------------------------
// Common response
// ---------------------------------------------------------------------------

/** API の処理結果を表す汎用レスポンス */
export type ActionResult = {
  readonly ok: boolean;
  readonly message?: string;
};

// ---------------------------------------------------------------------------
// DTO (Data Transfer Objects)
// ---------------------------------------------------------------------------

/** ClientDto -- dto/ClientDto.java */
export type ClientDto = {
  readonly clientId?: number;
  readonly clientName?: string;
  readonly industryCode?: string;
  readonly industryName?: string;
};

/** IndustryDto -- dto/IndustryDto.java */
export type IndustryDto = {
  readonly industryCode?: string;
  readonly industryName?: string;
};

/** ProjectDto -- dto/ProjectDto.java */
export type ProjectDto = {
  readonly projectId?: number;
  readonly projectName?: string;
  readonly projectType?: ProjectType;
  readonly projectClass?: ProjectClass;
  readonly projectStartDate?: string;
  readonly projectEndDate?: string;
  readonly clientId?: number;
  readonly clientName?: string;
  readonly projectManager?: string;
  readonly projectLeader?: string;
  readonly userId?: number;
  readonly note?: string;
  readonly sales?: number;
  readonly costOfGoodsSold?: number;
  readonly sga?: number;
  readonly allocationOfCorpExpenses?: number;
  readonly version?: number;
};

// ---------------------------------------------------------------------------
// Form (Request bodies)
// ---------------------------------------------------------------------------

/** LoginForm -- form/LoginForm.java */
export type LoginForm = {
  readonly loginId: string;
  readonly userPassword: string;
};

/** ProjectForm -- form/ProjectForm.java (新規作成用) */
export type ProjectForm = {
  readonly projectName: string;
  readonly projectType: ProjectType;
  readonly projectClass: ProjectClass;
  readonly projectManager?: string;
  readonly projectLeader?: string;
  readonly clientId: string;
  readonly clientName?: string;
  readonly projectStartDate?: string;
  readonly projectEndDate?: string;
  readonly note?: string;
  readonly sales?: string;
  readonly costOfGoodsSold?: string;
  readonly sga?: string;
  readonly allocationOfCorpExpenses?: string;
};

/** ProjectUpdateForm -- form/ProjectUpdateForm.java (更新用) */
export type ProjectUpdateForm = {
  readonly projectName: string;
  readonly projectType: ProjectType;
  readonly projectClass: ProjectClass;
  readonly projectManager?: string;
  readonly projectLeader?: string;
  readonly clientId: string;
  readonly clientName?: string;
  readonly projectStartDate?: string;
  readonly projectEndDate?: string;
  readonly note?: string;
  readonly sales?: string;
  readonly costOfGoodsSold?: string;
  readonly sga?: string;
  readonly allocationOfCorpExpenses?: string;
};

/** ProjectTargetForm -- form/ProjectTargetForm.java (削除用) */
export type ProjectTargetForm = {
  readonly projectId: string;
};

/** InnerProjectForm -- form/InnerProjectForm.java (一括更新の個別プロジェクト) */
export type InnerProjectForm = {
  readonly projectId: string;
  readonly projectName: string;
  readonly projectType: ProjectType;
  readonly projectStartDate?: string;
  readonly projectEndDate?: string;
};

/** ProjectBulkForm -- form/ProjectBulkForm.java (一括更新用) */
export type ProjectBulkForm = {
  readonly projectList?: readonly InnerProjectForm[];
};

/** ProjectSearchForm -- 検索パラメータ (GET query) */
export type ProjectSearchParams = {
  readonly pageNumber: string;
  readonly clientId?: string;
  readonly clientName?: string;
  readonly projectName?: string;
  readonly projectType?: ProjectType;
  readonly projectClass?: string[];
  readonly projectStartDateBegin?: string;
  readonly projectStartDateEnd?: string;
  readonly projectEndDateBegin?: string;
  readonly projectEndDateEnd?: string;
  readonly sortKey?: string;
  readonly sortDir?: string;
};

/** ClientSearchForm -- 顧客検索パラメータ (GET query) */
export type ClientSearchParams = {
  readonly clientName?: string;
  readonly industryCode?: string;
  readonly sortKey?: string;
  readonly sortDir?: string;
};
