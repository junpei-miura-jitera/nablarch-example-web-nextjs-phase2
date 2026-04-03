'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { apiProjectBulkFormSchema, type ApiProjectBulkFormValues } from ':/shared/api/project-bulk'
import { PROJECT_TYPE } from '../_constants/project-type'
import { PROJECT_SORT_KEY } from '../_constants/project-sort-key'
import { SORT_ORDER } from '../_constants/sort-order'
import { saveProjectFormToCookie, loadProjectFormFromCookie } from '../_utils/cookie-helpers'
import type { ApiProjectDto } from ':/shared/api/project'
import { formatDate, normalizeDateForApi } from '../_utils/format-date'

/**
 * プロジェクト一括更新フォーム。
 *
 * UseFieldArray で複数行のプロジェクトを同時編集する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/projectBulk/update.jsp
 */
export function BulkEditForm({
  projects,
  totalCount,
  sortKey,
  sortDir,
}: {
  projects: ApiProjectDto[]
  totalCount: number
  sortKey: string
  sortDir: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEmpty = projects.length === 0

  const initialItems: NonNullable<ApiProjectBulkFormValues['projectList']> = projects.map((p) => ({
    projectId: String(p.projectId ?? ''),
    projectName: p.projectName ?? '',
    projectType: p.projectType ?? 'development',
    projectStartDate: formatDate(p.projectStartDate),
    projectEndDate: formatDate(p.projectEndDate),
  }))

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ApiProjectBulkFormValues>({
    resolver: standardSchemaResolver(apiProjectBulkFormSchema),
    defaultValues: { projectList: initialItems },
  })

  // @see ProjectBulkAction.java L143-148: backToList — セッションから編集データを復元する処理に対応
  // 確認画面から「入力へ戻る」時は ?restore=1 が付くので Cookie から編集データを復元する
  const prevProjectsRef = useRef(projects)
  useEffect(() => {
    if (prevProjectsRef.current === projects) return
    prevProjectsRef.current = projects
    reset({
      projectList: projects.map((p) => ({
        projectId: String(p.projectId ?? ''),
        projectName: p.projectName ?? '',
        projectType: p.projectType ?? 'development',
        projectStartDate: formatDate(p.projectStartDate),
        projectEndDate: formatDate(p.projectEndDate),
      })),
    })
  }, [projects, reset])

  // 確認画面から戻った時に Cookie から編集内容を復元する
  const restoredRef = useRef(false)
  useEffect(() => {
    if (restoredRef.current) return
    if (!searchParams.get('restore')) return
    restoredRef.current = true
    ;(async () => {
      const data = await loadProjectFormFromCookie()
      if (data?.projectList) {
        const projectList = (
          data.projectList as NonNullable<ApiProjectBulkFormValues['projectList']>
        ).map((item) => ({
          ...item,
          projectStartDate: formatDate(item.projectStartDate),
          projectEndDate: formatDate(item.projectEndDate),
        }))
        reset({
          projectList,
        })
      }
    })()
  }, [searchParams, reset])

  // — update.jsp の <c:forEach items="${projectListDto.projectList}" ...> + <n:text name="bulkForm.projectList[${status.index}].fieldName"> に対応
  const { fields } = useFieldArray({ control, name: 'projectList' })

  async function onSubmit(data: ApiProjectBulkFormValues) {
    await saveProjectFormToCookie({ projectList: data.projectList })
    router.push('/projects/bulk/confirm')
  }

  function handleSortChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    params.set('pageNumber', '1')
    router.push(`/projects/bulk?${params.toString()}`)
  }

  return (
    <>
      <div className="title-nav">
        <span>プロジェクト検索一覧更新画面</span>
        <div className="button-nav">
          <button
            type="button"
            className="btn btn-lg btn-success"
            disabled={isEmpty}
            onClick={handleSubmit(onSubmit)}
          >
            更新
          </button>
          <Link href="/projects/new" className="btn btn-lg btn-light ms-2">
            新規登録
          </Link>
        </div>
      </div>

      {/* n:errors filter="global" に対応するグローバルエラーメッセージ表示領域 */}
      {/* @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/projectBulk/update.jsp */}
      <div className="message-area margin-top">
        {errors.root && <span className="message-error">{errors.root.message}</span>}
      </div>

      {/* sort-nav */}
      <div className="sort-nav mb-3">
        <div style={{ float: 'left' }}>
          <span className="font-group">検索結果</span>
          <span className="search-result-count">{totalCount}</span>
        </div>
        <div className="row justify-content-end">
          <div className="col-md-2">
            <select
              className="form-select form-select-lg"
              value={sortKey}
              onChange={(e) => handleSortChange('sortKey', e.target.value)}
            >
              {Object.entries(PROJECT_SORT_KEY).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-1">
            <select
              className="form-select form-select-lg"
              value={sortDir}
              onChange={(e) => handleSortChange('sortDir', e.target.value)}
            >
              {Object.entries(SORT_ORDER).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <section>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(onSubmit)()
          }}
        >
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
              {fields.map((field, index) => (
                <tr key={field.id} className="info">
                  <td>
                    <input type="hidden" {...register(`projectList.${index}.projectId`)} />
                    <Link href={`/projects/${field.projectId}`}>{field.projectId}</Link>
                  </td>
                  <td>
                    <div className="form-group">
                      <input
                        className={`form-control form-control-lg${errors.projectList?.[index]?.projectName ? ' input-error' : ''}`}
                        maxLength={64}
                        {...register(`projectList.${index}.projectName`)}
                      />
                      {/* — <n:error name="bulkForm.projectList[${status.index}].projectName"> に対応 */}
                      {errors.projectList?.[index]?.projectName && (
                        <span className="message-error">
                          {errors.projectList[index].projectName.message}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="form-group">
                      <select
                        className="form-select form-select-lg"
                        {...register(`projectList.${index}.projectType`)}
                      >
                        {Object.entries(PROJECT_TYPE).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                      {errors.projectList?.[index]?.projectType && (
                        <span className="message-error">
                          {errors.projectList[index].projectType.message}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="form-group">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        className={`form-control form-control-lg datepicker${errors.projectList?.[index]?.projectStartDate ? ' input-error' : ''}`}
                        {...register(`projectList.${index}.projectStartDate`, {
                          required: '開始日を入力してください',
                        })}
                      />
                      {errors.projectList?.[index]?.projectStartDate && (
                        <span className="message-error">
                          {errors.projectList[index].projectStartDate.message}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="form-group">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        className={`form-control form-control-lg datepicker${errors.projectList?.[index]?.projectEndDate ? ' input-error' : ''}`}
                        {...register(`projectList.${index}.projectEndDate`, {
                          required: '終了日を入力してください',
                          validate: (value, formValues) => {
                            const startDate = normalizeDateForApi(
                              formValues.projectList![index].projectStartDate,
                            )
                            const endDate = normalizeDateForApi(value)
                            if (startDate && endDate && startDate > endDate) {
                              return 'プロジェクト終了日はプロジェクト開始日より後の日付を入力して下さい。'
                            }
                            return true
                          },
                        })}
                      />
                      {errors.projectList?.[index]?.projectEndDate && (
                        <span className="message-error">
                          {errors.projectList[index].projectEndDate.message}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </section>

      <div className="title-nav page-footer">
        <div className="button-nav">
          <button
            type="button"
            className="btn btn-lg btn-success"
            disabled={isEmpty}
            onClick={handleSubmit(onSubmit)}
          >
            更新
          </button>
          <Link href="/projects/new" className="btn btn-lg btn-light ms-2">
            新規登録
          </Link>
        </div>
      </div>
    </>
  )
}
