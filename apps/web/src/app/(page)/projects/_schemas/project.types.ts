/**
 * API レスポンスで使用される DTO 型定義。
 *
 * openapi-typescript で生成された components["schemas"] の型を
 * 手書きの TypeScript 型として再定義する。
 */

export type ProjectDto = {
  projectId?: number;
  projectName?: string;
  projectType?: "development" | "maintenance";
  projectClass?: "ss" | "s" | "a" | "b" | "c" | "d";
  projectStartDate?: string;
  projectEndDate?: string;
  clientId?: number;
  clientName?: string;
  projectManager?: string;
  projectLeader?: string;
  userId?: number;
  note?: string;
  sales?: number;
  costOfGoodsSold?: number;
  sga?: number;
  allocationOfCorpExpenses?: number;
  version?: number;
};

export type ClientDto = {
  clientId?: number;
  clientName?: string;
  industryCode?: string;
  industryName?: string;
};

export type IndustryDto = {
  industryCode?: string;
  industryName?: string;
};

export type ProjectForm = {
  projectName: string;
  projectType: "development" | "maintenance";
  projectClass: "ss" | "s" | "a" | "b" | "c" | "d";
  projectManager?: string;
  projectLeader?: string;
  clientId: string;
  clientName?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  note?: string;
  sales?: string;
  costOfGoodsSold?: string;
  sga?: string;
  allocationOfCorpExpenses?: string;
};

export type ProjectUpdateForm = {
  projectName: string;
  projectType: "development" | "maintenance";
  projectClass: "ss" | "s" | "a" | "b" | "c" | "d";
  projectManager?: string;
  projectLeader?: string;
  clientId: string;
  clientName?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  note?: string;
  sales?: string;
  costOfGoodsSold?: string;
  sga?: string;
  allocationOfCorpExpenses?: string;
};

export type InnerProjectForm = {
  projectId: string;
  projectName: string;
  projectType: "development" | "maintenance";
  projectStartDate?: string;
  projectEndDate?: string;
};

/** API リクエストボディ用の型エイリアス（MSW ハンドラー向け）。 */
export type LoginFormRequest = {
  loginId: string;
  userPassword: string;
};

/** API リクエストボディ用の型エイリアス（MSW ハンドラー向け）。 */
export type ProjectFormRequest = ProjectForm;

/** API リクエストボディ用の型エイリアス（MSW ハンドラー向け）。 */
export type InnerProjectFormRequest = InnerProjectForm;
