'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { ClientSearchModal, type ClientSelection } from ':/app/(page)/projects/_components/client-search-modal'
import { ProjectFormFields } from ':/app/(page)/projects/_components/project-form-fields'
import { applyProjectFormValues } from ':/app/(page)/projects/_utils/project-form-values'
import { apiProjectFormSchema, type ApiProjectFormValues } from ':/app/(page)/projects/_utils/api/project'
import {
  clearProjectFormCookie,
  loadProjectFormFromCookie,
  saveProjectFormToCookie,
} from '../_utils/cookie-helpers'
import { getSavedListUrl } from '../_utils/list-url'

/**
 * プロジェクト新規登録フォーム。
 *
 * Cookie からの復元（確認画面から「戻る」時）に対応。確認画面への遷移時に
 * Cookie にフォームデータを保存する。
 */
export function CreateProjectForm({ clearCookie }: { clearCookie?: boolean }) {
  const router = useRouter()
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ApiProjectFormValues>({
    resolver: standardSchemaResolver(apiProjectFormSchema),
  })

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

  useEffect(() => {
    ;(async () => {
      if (clearCookie) {
        await clearProjectFormCookie()
        return
      }
      const data = await loadProjectFormFromCookie()
      if (data) {
        applyProjectFormValues(setValue, data)
      }
    })()
  }, [clearCookie, setValue])

  async function onSubmit(data: ApiProjectFormValues) {
    await saveProjectFormToCookie(data as Record<string, unknown>)
    router.push('/projects/new/confirm')
  }

  function handleBack() {
    router.push(getSavedListUrl('/projects'))
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit(onSubmit)()
      }}
    >
      <div className="title-nav">
        <span className="page-title">プロジェクト登録画面</span>
        <div className="button-nav">
          <div className="button-block real-button-block">
            <button type="button" className="btn btn-lg btn-success" onClick={handleSubmit(onSubmit)}>
              登録
            </button>
          </div>
          <div className="button-block link-button-block">
            <a
              id="topBackLink"
              href={getSavedListUrl('/projects')}
              className="btn btn-lg btn-light"
              onClick={(event) => {
                event.preventDefault()
                handleBack()
              }}
            >
              戻る
            </a>
          </div>
        </div>
      </div>

      <div className="message-area margin-top">
        {errors.root && <span className="message-error">{errors.root.message}</span>}
      </div>

      <h2 className="font-group mb-3">プロジェクト情報</h2>

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
          <div className="button-block real-button-block">
            <button type="button" className="btn btn-lg btn-success" onClick={handleSubmit(onSubmit)}>
              登録
            </button>
          </div>
          <div className="button-block link-button-block">
            <a
              id="bottomBackLink"
              href={getSavedListUrl('/projects')}
              className="btn btn-lg btn-light"
              onClick={(event) => {
                event.preventDefault()
                handleBack()
              }}
            >
              戻る
            </a>
          </div>
        </div>
      </div>

      <ClientSearchModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelect={handleClientSelect}
      />
    </form>
  )
}
