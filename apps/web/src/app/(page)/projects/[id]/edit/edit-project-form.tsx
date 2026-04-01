"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { apiPost } from ":/app/(api)/_utils/client";
import { projectUpdateFormSchema, type ProjectUpdateForm as ProjectFormValues } from "../../_schemas/project-update-form.schema";
import type { ProjectDto } from "../../_schemas/project.types";
import { ClientSearchModal } from "../../_fragments/client-search-modal";
import { PROJECT_TYPE } from "../../_constants/project-type";
import { PROJECT_CLASS } from "../../_constants/project-class";
import {
  saveProjectFormToCookie,
  loadProjectFormFromCookie,
} from "../../_utils/cookie-helpers";
import { transformProjectFormData } from "../../_utils/project-form-helpers";

/** 金額フィールドの9桁制限バリデーション */
// — Form クラスの @Length(max=9) に対応
function validateAmountDigits(value: string | undefined) {
  if (!value) return true;
  if (String(value).replace(/^-/, "").length > 9) return "9桁以内で入力してください";
  return true;
}

/**
 * プロジェクト変更フォーム。
 *
 * 既存プロジェクトの編集・削除を行う。
 * 確認画面への遷移時に Cookie にフォームデータを保存する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/update.jsp
 * @see _references/nablarch-example-web/src/main/webapp/javascripts/projectInput.js
 */
export function EditProjectForm({ project, projectId }: { project: ProjectDto; projectId: number }) {
  const router = useRouter();
  // version/projectId may be restored from cookie (returning from confirm page)
  // to avoid using stale server data if another user updated in the meantime
  const [effectiveVersion, setEffectiveVersion] = useState(project.version ?? 0);
  const [effectiveProjectId, setEffectiveProjectId] = useState(projectId);
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: standardSchemaResolver(projectUpdateFormSchema),
  });

  const validKeys: (keyof ProjectFormValues)[] = [
    "projectName", "projectType", "projectClass",
    "projectManager", "projectLeader", "clientId", "clientName",
    "projectStartDate", "projectEndDate", "note",
    "sales", "costOfGoodsSold", "sga", "allocationOfCorpExpenses",
  ];

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Initialize form: prefer cookie data (returning from confirm page), fall back to server data
  const initialised = useRef(false);
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    (async () => {
      const cookieData = await loadProjectFormFromCookie();
      if (cookieData) {
        const d = cookieData as Record<string, string>;
        // Restore version and projectId from cookie before filtering form fields
        if (d.version != null) setEffectiveVersion(Number(d.version));
        if (d.projectId != null) setEffectiveProjectId(Number(d.projectId));
        for (const key of Object.keys(d)) {
          if (d[key] != null && validKeys.includes(key as keyof ProjectFormValues))
            setValue(key as keyof ProjectFormValues, String(d[key]));
        }
      } else {
        setValue("projectName", project.projectName ?? "");
        if (project.projectType) setValue("projectType", project.projectType);
        if (project.projectClass) setValue("projectClass", project.projectClass);
        setValue("projectManager", project.projectManager ?? "");
        setValue("projectLeader", project.projectLeader ?? "");
        setValue("clientId", String(project.clientId ?? ""));
        setValue("clientName", project.clientName ?? "");
        setValue("projectStartDate", project.projectStartDate ?? "");
        setValue("projectEndDate", project.projectEndDate ?? "");
        setValue("note", project.note ?? "");
        setValue("sales", project.sales != null ? String(project.sales) : "");
        setValue("costOfGoodsSold", project.costOfGoodsSold != null ? String(project.costOfGoodsSold) : "");
        setValue("sga", project.sga != null ? String(project.sga) : "");
        setValue("allocationOfCorpExpenses", project.allocationOfCorpExpenses != null ? String(project.allocationOfCorpExpenses) : "");
      }
    })();
  }, [project, setValue]);

  async function onSubmit(data: ProjectFormValues) {
    const formData = { ...transformProjectFormData(data), projectId: effectiveProjectId, version: effectiveVersion };
    // Nablarch session scope の代替。バックエンド接続時はサーバーサイド session に移行
    await saveProjectFormToCookie(formData);
    router.push(`/projects/${effectiveProjectId}/edit/confirm`);
  }

  // @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java の delete メソッド
  async function handleDelete() {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await apiPost("/api/project/delete", {
        projectId: String(effectiveProjectId),
        version: String(effectiveVersion),
      });
      router.push("/projects/delete-complete");
    } catch {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
      setDeleteError("削除に失敗しました。");
    }
  }

  const handleClientSelect = useCallback(
    (client: { clientId: number; clientName: string }) => {
      setValue("clientId", String(client.clientId));
      setValue("clientName", client.clientName);
    },
    [setValue],
  );

  function handleClientClear() {
    setValue("clientId", "");
    setValue("clientName", "");
  }

  // -- Delete confirmation UI
  // 元 JSP (update.jsp) は削除ボタン押下で即 POST（確認なし）。
  // Next.js では誤操作防止のためインライン確認 UI を追加している。
  const deleteConfirmationUi = isConfirmingDelete ? (
    <span className="ms-2">
      <span>本当に削除しますか？</span>
      <button type="button" className="btn btn-sm btn-danger ms-2" onClick={handleDelete} disabled={isDeleting}>はい</button>
      <button type="button" className="btn btn-sm btn-secondary ms-1" onClick={() => setIsConfirmingDelete(false)} disabled={isDeleting}>いいえ</button>
    </span>
  ) : null;

  return (
    <>
      <div className="title-nav">
        <span className="page-title">プロジェクト変更画面</span>
        <div className="button-nav">
          <button type="button" className="btn btn-lg btn-light" onClick={() => router.push(`/projects/${projectId}`)}>戻る</button>
          <button type="button" className="btn btn-lg btn-danger ms-2" onClick={() => { setDeleteError(null); setIsConfirmingDelete(true); }} disabled={isDeleting || isConfirmingDelete}>削除</button>
          {deleteConfirmationUi}
          <button type="button" className="btn btn-lg btn-success ms-2" onClick={handleSubmit(onSubmit)}>更新</button>
        </div>
        {deleteError && <span className="message-error">{deleteError}</span>}
      </div>

      {/* — update.jsp: <n:errors filter="global"> に対応。バックエンド接続時はAPIエラーをここに表示 */}
      <div className="message-area margin-top">
        {errors.root && <span className="message-error">{errors.root.message}</span>}
      </div>

      <h2 className="font-group mb-3">プロジェクト詳細</h2>

      <section>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(); }}>
          <table className="table">
            <tbody>
              <tr><th className="required width-250">プロジェクト名</th><td><div className="form-group"><input className={`form-control form-control-lg width-300${errors.projectName ? " input-error" : ""}`} maxLength={64} {...register("projectName")} />{errors.projectName && <span className="message-error">{errors.projectName.message}</span>}</div></td></tr>
              <tr><th className="required width-250">プロジェクト種別</th><td><div className="form-group"><select className={`form-select form-select-lg${errors.projectType ? " input-error" : ""}`} {...register("projectType", )}>{Object.entries(PROJECT_TYPE).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}</select>{errors.projectType && <span className="message-error">{errors.projectType.message}</span>}</div></td></tr>
              <tr><th className="required width-250">プロジェクト分類</th><td><div className="form-group"><select className={`form-select form-select-lg${errors.projectClass ? " input-error" : ""}`} {...register("projectClass", )}>{Object.entries(PROJECT_CLASS).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}</select>{errors.projectClass && <span className="message-error">{errors.projectClass.message}</span>}</div></td></tr>
              <tr><th className="width-250">プロジェクトマネージャー</th><td><div className="form-group"><input className={`form-control form-control-lg width-300${errors.projectManager ? " input-error" : ""}`} maxLength={64} {...register("projectManager")} />{errors.projectManager && <span className="message-error">{errors.projectManager.message}</span>}</div></td></tr>
              <tr><th className="width-250">プロジェクトリーダー</th><td><div className="form-group"><input className={`form-control form-control-lg width-300${errors.projectLeader ? " input-error" : ""}`} maxLength={64} {...register("projectLeader")} />{errors.projectLeader && <span className="message-error">{errors.projectLeader.message}</span>}</div></td></tr>
              <tr>
                <th className="required width-250">顧客名</th>
                <td>
                  <div className="form-group">
                    <input className={`form-control form-control-lg mb-1${errors.clientId ? " input-error" : ""}`} readOnly tabIndex={-1} maxLength={10} {...register("clientId", )} />
                    <input className={`form-control form-control-lg mb-1${errors.clientName ? " input-error" : ""}`} readOnly tabIndex={-1} maxLength={64} {...register("clientName")} />
                  </div>
                  <div className="btn-group-sm">
                    <button type="button" className="badge rounded-pill text-dark bg-body-secondary" onClick={() => setIsClientModalOpen(true)}><i className="material-icons">search</i></button>
                    <button type="button" className="badge rounded-pill text-dark bg-body-secondary" onClick={() => handleClientClear()}><i className="material-icons">remove</i></button>
                  </div>
                  {errors.clientId && <span className="message-error">{errors.clientId.message}</span>}
                  {/* — update.jsp L131: <n:error name="form.clientName"> */}
                  {errors.clientName && <span className="message-error">{errors.clientName.message}</span>}
                </td>
              </tr>
              <tr><th className="width-250">プロジェクト開始日</th><td><div className="form-group"><input type="date" className={`form-control form-control-lg${errors.projectStartDate ? " input-error" : ""}`} {...register("projectStartDate")} />{/* — update.jsp L144: <n:error name="form.projectStartDate"> */}{errors.projectStartDate && <span className="message-error">{errors.projectStartDate.message}</span>}</div></td></tr>
              {/* — update.jsp の validProjectPeriod エラーに対応 */}
              <tr><th className="width-250">プロジェクト終了日</th><td><div className="form-group"><input type="date" className={`form-control form-control-lg${errors.projectEndDate ? " input-error" : ""}`} {...register("projectEndDate", { validate: (value) => { const start = getValues("projectStartDate"); if (!value || !start) return true; if (value < start) return "開始日以降の日付を入力してください"; return true; } })} />{errors.projectEndDate && <span className="message-error">{errors.projectEndDate.message}</span>}</div></td></tr>
              <tr><th className="width-250">備考</th><td><div className="form-group"><textarea className={`form-control form-control-lg${errors.note ? " input-error" : ""}`} rows={5} cols={50} {...register("note")} />{errors.note && <span className="message-error">{errors.note.message}</span>}</div></td></tr>
              <tr><th className="width-250">売上高</th><td><div className="form-group"><input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={9} className={`form-control form-control-lg width-200 me-3${errors.sales ? " input-error" : ""}`} style={{ float: "left" }} {...register("sales", { validate: validateAmountDigits })} /><div style={{ display: "table-cell", height: "30px", verticalAlign: "bottom" }}>千円</div>{errors.sales && <div style={{ clear: "left" }}><span className="message-error">{errors.sales.message}</span></div>}</div></td></tr>
              <tr><th className="width-250">売上原価</th><td><div className="form-group"><input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={9} className={`form-control form-control-lg width-200 me-3${errors.costOfGoodsSold ? " input-error" : ""}`} style={{ float: "left" }} {...register("costOfGoodsSold", { validate: validateAmountDigits })} /><div style={{ display: "table-cell", height: "30px", verticalAlign: "bottom" }}>千円</div>{errors.costOfGoodsSold && <div style={{ clear: "left" }}><span className="message-error">{errors.costOfGoodsSold.message}</span></div>}</div></td></tr>
              <tr><th className="width-250">販管費</th><td><div className="form-group"><input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={9} className={`form-control form-control-lg width-200 me-3${errors.sga ? " input-error" : ""}`} style={{ float: "left" }} {...register("sga", { validate: validateAmountDigits })} /><div style={{ display: "table-cell", height: "30px", verticalAlign: "bottom" }}>千円</div>{errors.sga && <div style={{ clear: "left" }}><span className="message-error">{errors.sga.message}</span></div>}</div></td></tr>
              <tr><th className="width-250">本社配賦</th><td><div className="form-group"><input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={9} className={`form-control form-control-lg width-200 me-3${errors.allocationOfCorpExpenses ? " input-error" : ""}`} style={{ float: "left" }} {...register("allocationOfCorpExpenses", { validate: validateAmountDigits })} /><div style={{ display: "table-cell", height: "30px", verticalAlign: "bottom" }}>千円</div>{errors.allocationOfCorpExpenses && <div style={{ clear: "left" }}><span className="message-error">{errors.allocationOfCorpExpenses.message}</span></div>}</div></td></tr>
            </tbody>
          </table>
        </form>
      </section>

      <div className="title-nav page-footer">
        <div className="button-nav">
          <button type="button" className="btn btn-lg btn-light" onClick={() => router.push(`/projects/${projectId}`)}>戻る</button>
          <button type="button" className="btn btn-lg btn-danger ms-2" onClick={() => { setDeleteError(null); setIsConfirmingDelete(true); }} disabled={isDeleting || isConfirmingDelete}>削除</button>
          {deleteConfirmationUi}
          <button type="button" className="btn btn-lg btn-success ms-2" onClick={handleSubmit(onSubmit)}>更新</button>
        </div>
        {deleteError && <span className="message-error">{deleteError}</span>}
      </div>

      <ClientSearchModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelect={handleClientSelect}
      />
    </>
  );
}
