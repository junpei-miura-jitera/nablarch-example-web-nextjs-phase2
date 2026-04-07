'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
  apiProjectUpdateFormSchema,
  type ApiProjectDto,
  type ApiProjectFormValues,
} from ':/app/(page)/projects/_utils/api/project'
import { ClientSearchModal, type ClientSelection } from ':/app/(page)/projects/_components/client-search-modal'
import { ProjectFormFields } from ':/app/(page)/projects/_components/project-form-fields'
import {
  applyProjectFormValues,
  buildProjectFormValuesFromProject,
} from ':/app/(page)/projects/_utils/project-form-values'
import { loadProjectFormFromCookie, saveProjectFormToCookie } from '../../_utils/cookie-helpers'

/**
 * プロジェクト変更フォーム。
 *
 * 既存プロジェクトの編集・削除を行う。確認画面への遷移時に Cookie に
 * フォームデータを保存する。
 */
export function EditProjectForm({
  project,
  projectId,
}: {
  project: ApiProjectDto
  projectId: number
}) {
  const router = useRouter()
  const [effectiveVersion, setEffectiveVersion] = useState(project.version ?? 0)
  const [effectiveProjectId, setEffectiveProjectId] = useState(projectId)
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ApiProjectFormValues>({
    resolver: standardSchemaResolver(apiProjectUpdateFormSchema),
  })

  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const initialised = useRef(false)

  useEffect(() => {
    if (initialised.current) return
    initialised.current = true

    ;(async () => {
      const cookieData = await loadProjectFormFromCookie()
      if (cookieData) {
        const restored = cookieData as Record<string, unknown>
        if (restored.version != null) setEffectiveVersion(Number(restored.version))
        if (restored.projectId != null) setEffectiveProjectId(Number(restored.projectId))
        applyProjectFormValues(setValue, restored)
        return
      }

      applyProjectFormValues(setValue, buildProjectFormValuesFromProject(project))
    })()
  }, [project, setValue])

  async function onSubmit(data: ApiProjectFormValues) {
    await saveProjectFormToCookie({
      ...data,
      projectId: effectiveProjectId,
      version: effectiveVersion,
    })
    router.push(`/projects/${effectiveProjectId}/edit/confirm`)
  }

  async function handleDelete() {
    setDeleteError(null)
    setIsDeleting(true)
    try {
      const res = await fetch('/api/project/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: String(effectiveProjectId),
          version: String(effectiveVersion),
        }),
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      router.push('/projects/delete-complete')
    } catch {
      setIsDeleting(false)
      setDeleteError('削除に失敗しました。')
    }
  }

  const handleClientSelect = useCallback(
    (client: ClientSelection) => {
      setValue('clientId', String(client.clientId))
      setValue('clientName', client.clientName)
    },
    [setValue],
  )

  const handleClientClear = useCallback(() => {
    setValue('clientId', '')
    setValue('clientName', '')
  }, [setValue])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit(onSubmit)()
      }}
    >
      <div className="title-nav">
        <span className="page-title">プロジェクト変更画面</span>
        <div className="button-nav">
          <button
            type="button"
            className="btn btn-lg btn-light"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            戻る
          </button>
          <button
            type="button"
            className="btn btn-lg btn-danger ms-2"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            削除
          </button>
          <button
            type="button"
            className="btn btn-lg btn-success ms-2"
            onClick={handleSubmit(onSubmit)}
          >
            更新
          </button>
        </div>
        {deleteError && <span className="message-error">{deleteError}</span>}
      </div>

      <div className="message-area margin-top">
        {errors.root && <span className="message-error">{errors.root.message}</span>}
      </div>

      <h2 className="font-group mb-3">プロジェクト詳細</h2>

      <table className="table w-100">
        <ProjectFormFields
          register={register}
          errors={errors}
          getValues={getValues}
          onOpenClientSearch={() => setIsClientModalOpen(true)}
          onClearClientSelection={handleClientClear}
        />
      </table>

      <div className="title-nav page-footer">
        <div className="button-nav">
          <button
            type="button"
            className="btn btn-lg btn-light"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            戻る
          </button>
          <button
            type="button"
            className="btn btn-lg btn-danger ms-2"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            削除
          </button>
          <button
            type="button"
            className="btn btn-lg btn-success ms-2"
            onClick={handleSubmit(onSubmit)}
          >
            更新
          </button>
        </div>
        {deleteError && <span className="message-error">{deleteError}</span>}
      </div>

      <ClientSearchModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelect={handleClientSelect}
      />
    </form>
  )
}
