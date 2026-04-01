"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ClientSearchModal } from "../_fragments/client-search-modal";
import { projectFormSchema, type ProjectForm as ProjectFormValues } from "../_schemas/project-form.schema";
import { PROJECT_TYPE } from "../_constants/project-type";
import { PROJECT_CLASS } from "../_constants/project-class";
import {
  saveProjectFormToCookie,
  loadProjectFormFromCookie,
} from "../_utils/cookie-helpers";
import { transformProjectFormData } from "../_utils/project-form-helpers";

/**
 * プロジェクト新規登録フォーム。
 *
 * Cookie からの復元（確認画面から「戻る」時）に対応。
 * 確認画面への遷移時に Cookie にフォームデータを保存する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/create.jsp
 * @see _references/nablarch-example-web/src/main/webapp/javascripts/projectInput.js
 */
export function CreateProjectForm() {
  const router = useRouter();
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: standardSchemaResolver(projectFormSchema),
  });

  const validKeys: (keyof ProjectFormValues)[] = [
    "projectName", "projectType", "projectClass",
    "projectManager", "projectLeader", "clientId", "clientName",
    "projectStartDate", "projectEndDate", "note",
    "sales", "costOfGoodsSold", "sga", "allocationOfCorpExpenses",
  ];

  const handleClientSelect = useCallback(
    (client: { clientId: number; clientName: string }) => {
      setValue("clientId", String(client.clientId));
      setValue("clientName", client.clientName);
    },
    [setValue],
  );

  const handleClientClear = useCallback(() => {
    setValue("clientId", "");
    setValue("clientName", "");
  }, [setValue]);

  // Restore form data from cookie (when returning from confirm page)
  useEffect(() => {
    (async () => {
      const data = await loadProjectFormFromCookie();
      if (data) {
        const d = data as Record<string, string>;
        for (const key of Object.keys(d)) {
          if (d[key] != null && validKeys.includes(key as keyof ProjectFormValues))
            setValue(key as keyof ProjectFormValues, String(d[key]));
        }
      }
    })();
  }, [setValue]);

  async function onSubmit(data: ProjectFormValues) {
    const formData = transformProjectFormData(data);
    // Nablarch session scope の代替。バックエンド接続時はサーバーサイド session に移行
    await saveProjectFormToCookie(formData);
    router.push("/projects/new/confirm");
  }

  function handleBack() {
    const raw = sessionStorage.getItem("listUrl") ?? "/projects";
    // open redirect 防止: 相対パスのみ許可
    const listUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/projects";
    router.push(listUrl);
  }

  return (
    <>
      <div className="title-nav">
        <span className="page-title">プロジェクト登録画面</span>
        {/* — create.jsp L30-35: 登録ボタン → 戻るリンクの順 */}
        <div className="button-nav">
          <button
            type="button"
            className="btn btn-lg btn-success"
            onClick={handleSubmit(onSubmit)}
          >
            登録
          </button>
          <button
            type="button"
            className="btn btn-lg btn-light ms-2"
            onClick={handleBack}
          >
            戻る
          </button>
        </div>
      </div>

      {/* — create.jsp: <n:errors filter="global"> に対応。バックエンド接続時はAPIエラーをここに表示 */}
      <div className="message-area margin-top">
        {errors.root && <span className="message-error">{errors.root.message}</span>}
      </div>
      <h2 className="font-group mb-3">プロジェクト情報</h2>
      <section>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)();
          }}
        >
          <table className="table">
            <tbody>
              {/* projectName - required */}
              <tr>
                <th className="required width-250">プロジェクト名</th>
                <td>
                  <div className="form-group">
                    <input
                      className={`form-control form-control-lg width-300${errors.projectName ? " input-error" : ""}`}
                      maxLength={64}
                      {...register("projectName")}
                    />
                    {errors.projectName && (
                      <span className="message-error">
                        {errors.projectName.message}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
              {/* projectType - required select */}
              <tr>
                <th className="required width-250">プロジェクト種別</th>
                <td>
                  <div className="form-group">
                    <select
                      className={`form-select form-select-lg${errors.projectType ? " input-error" : ""}`}
                      {...register("projectType")}
                    >
                      {Object.entries(PROJECT_TYPE).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {errors.projectType && (
                      <span className="message-error">
                        {errors.projectType.message}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
              {/* projectClass - required select */}
              <tr>
                <th className="required width-250">プロジェクト分類</th>
                <td>
                  <div className="form-group">
                    <select
                      className={`form-select form-select-lg${errors.projectClass ? " input-error" : ""}`}
                      {...register("projectClass")}
                    >
                      {Object.entries(PROJECT_CLASS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {errors.projectClass && (
                      <span className="message-error">
                        {errors.projectClass.message}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
              {/* projectManager - optional */}
              <tr>
                <th className="width-250">
                  プロジェクトマネージャー
                </th>
                <td>
                  <div className="form-group">
                    <input
                      className={`form-control form-control-lg width-300${errors.projectManager ? " input-error" : ""}`}
                      maxLength={64}
                      {...register("projectManager")}
                    />
                    {errors.projectManager && (
                      <span className="message-error">
                        {errors.projectManager.message}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
              {/* projectLeader - optional */}
              <tr>
                <th className="width-250">
                  プロジェクトリーダー
                </th>
                <td>
                  <div className="form-group">
                    <input
                      className={`form-control form-control-lg width-300${errors.projectLeader ? " input-error" : ""}`}
                      maxLength={64}
                      {...register("projectLeader")}
                    />
                    {errors.projectLeader && (
                      <span className="message-error">
                        {errors.projectLeader.message}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
              {/* clientId + clientName - required, readonly (set via modal) */}
              <tr>
                <th className="required width-250">顧客名</th>
                <td>
                  <div className="form-group">
                    <input
                      className={`form-control form-control-lg mb-1${errors.clientId ? " input-error" : ""}`}
                      maxLength={10}
                      readOnly
                      tabIndex={-1}
                      id="client-id"
                      {...register("clientId")}
                    />
                    <input
                      className={`form-control form-control-lg mb-1${errors.clientName ? " input-error" : ""}`}
                      maxLength={64}
                      readOnly
                      tabIndex={-1}
                      id="client-name"
                      {...register("clientName")}
                    />
                  </div>
                  <div className="btn-group-sm">
                    <button
                      type="button"
                      className="badge rounded-pill text-dark bg-body-secondary"
                      onClick={() => setIsClientModalOpen(true)}
                    >
                      <i className="material-icons">search</i>
                    </button>
                    <button
                      type="button"
                      className="badge rounded-pill text-dark bg-body-secondary"
                      id="client-remove"
                      onClick={() => handleClientClear()}
                    >
                      <i className="material-icons">remove</i>
                    </button>
                  </div>
                  {errors.clientId && (
                    <span className="message-error">
                      {errors.clientId.message}
                    </span>
                  )}
                  {/* — create.jsp L134: <n:error name="form.clientName"> */}
                  {errors.clientName && (
                    <span className="message-error">
                      {errors.clientName.message}
                    </span>
                  )}
                </td>
              </tr>
              {/* dates */}
              <tr>
                <th className="width-250">
                  プロジェクト開始日
                </th>
                <td>
                  <div className="form-group">
                    <input
                      type="date"
                      className={`form-control form-control-lg${errors.projectStartDate ? " input-error" : ""}`}
                      {...register("projectStartDate")}
                    />
                    {/* — create.jsp L145: <n:error name="form.projectStartDate"> */}
                    {errors.projectStartDate && (
                      <span className="message-error">
                        {errors.projectStartDate.message}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <th className="width-250">
                  プロジェクト終了日
                </th>
                <td>
                  <div className="form-group">
                    <input
                      type="date"
                      className={`form-control form-control-lg${errors.projectEndDate ? " input-error" : ""}`}
                      // — update.jsp の validProjectPeriod エラーに対応
                      {...register("projectEndDate", {
                        validate: (value) => {
                          const start = getValues("projectStartDate");
                          if (start && value && value < start) {
                            return "プロジェクト終了日はプロジェクト開始日より後の日付を入力して下さい。";
                          }
                          return true;
                        },
                      })}
                    />
                    {errors.projectEndDate && (
                      <span className="message-error">
                        {errors.projectEndDate.message}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
              {/* note */}
              <tr>
                <th className="width-250">備考</th>
                <td>
                  <div className="form-group">
                    <textarea
                      className={`form-control form-control-lg${errors.note ? " input-error" : ""}`}
                      rows={5}
                      cols={50}
                      {...register("note")}
                    />
                    {errors.note && (
                      <span className="message-error">
                        {errors.note.message}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
              {/* monetary fields — 元 JSP では th は「売上高」のみ、td 内 input 横に <div>千円</div> */}
              <tr>
                <th className="width-250">売上高</th>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={9} // — ProjectForm.java の @Length(max=9) に対応
                      className={`form-control form-control-lg width-200 me-3${errors.sales ? " input-error" : ""}`}
                      style={{ float: "left" }}
                      {...register("sales")}
                    />
                    <div style={{ display: "table-cell", height: "30px", verticalAlign: "bottom" }}>千円</div>
                    {/* — create.jsp L182: <n:error name="form.sales"> */}
                    {errors.sales && <div style={{ clear: "left" }}><span className="message-error">{errors.sales.message}</span></div>}
                  </div>
                </td>
              </tr>
              <tr>
                <th className="width-250">売上原価</th>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={9} // — ProjectForm.java の @Length(max=9) に対応
                      className={`form-control form-control-lg width-200 me-3${errors.costOfGoodsSold ? " input-error" : ""}`}
                      style={{ float: "left" }}
                      {...register("costOfGoodsSold")}
                    />
                    <div style={{ display: "table-cell", height: "30px", verticalAlign: "bottom" }}>千円</div>
                    {/* — create.jsp L199: <n:error name="form.costOfGoodsSold"> */}
                    {errors.costOfGoodsSold && <div style={{ clear: "left" }}><span className="message-error">{errors.costOfGoodsSold.message}</span></div>}
                  </div>
                </td>
              </tr>
              <tr>
                <th className="width-250">販管費</th>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={9} // — ProjectForm.java の @Length(max=9) に対応
                      className={`form-control form-control-lg width-200 me-3${errors.sga ? " input-error" : ""}`}
                      style={{ float: "left" }}
                      {...register("sga")}
                    />
                    <div style={{ display: "table-cell", height: "30px", verticalAlign: "bottom" }}>千円</div>
                    {/* — create.jsp L216: <n:error name="form.sga"> */}
                    {errors.sga && <div style={{ clear: "left" }}><span className="message-error">{errors.sga.message}</span></div>}
                  </div>
                </td>
              </tr>
              <tr>
                <th className="width-250">本社配賦</th>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={9} // — ProjectForm.java の @Length(max=9) に対応
                      className={`form-control form-control-lg width-200 me-3${errors.allocationOfCorpExpenses ? " input-error" : ""}`}
                      style={{ float: "left" }}
                      {...register("allocationOfCorpExpenses")}
                    />
                    <div style={{ display: "table-cell", height: "30px", verticalAlign: "bottom" }}>千円</div>
                    {/* — create.jsp L233: <n:error name="form.allocationOfCorpExpenses"> */}
                    {errors.allocationOfCorpExpenses && <div style={{ clear: "left" }}><span className="message-error">{errors.allocationOfCorpExpenses.message}</span></div>}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </section>

      {/* — create.jsp L289-294: フッターも同じボタン順 */}
      <div className="title-nav page-footer">
        <div className="button-nav">
          <button
            type="button"
            className="btn btn-lg btn-success"
            onClick={handleSubmit(onSubmit)}
          >
            登録
          </button>
          <button
            type="button"
            className="btn btn-lg btn-light ms-2"
            onClick={handleBack}
          >
            戻る
          </button>
        </div>
      </div>

      <ClientSearchModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelect={handleClientSelect}
      />
    </>
  );
}
