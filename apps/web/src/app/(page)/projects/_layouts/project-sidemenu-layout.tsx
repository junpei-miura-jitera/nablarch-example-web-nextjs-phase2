'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ClientSearchModal } from '../_fragments/client-search-modal'
import { buildPeriodSearchUrl } from '../_utils/search-params-helpers'
import { PROJECT_CLASS } from '../_constants/project-class'

/**
 * サイドメニュー（検索フォーム）付きレイアウト。
 *
 * プロジェクト検索条件（ランク・期間・顧客・名前）のサイドバーとメインコンテンツ領域を並べる。
 *
 * 変換メモ:
 *
 * - JSP の `searchForm.` プレフィクス（Nablarch のフォームバインディング用）は Next.js では不要なため除去し、フラットな name 属性に変換した。
 * - 顧客検索 API: 元の clientList.js は `/api/clients` を呼び出していたが、 OpenAPI 定義に合わせて `/api/client/find` に変更した。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/sidemenu.jsp
 * @see _references/nablarch-example-web/src/main/webapp/javascripts/sideMenu.js
 */
export function ProjectSidemenuLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)

  // 一括更新画面 (/projects/bulk) からの検索は /projects/bulk に遷移させる
  const formActionPath = pathname.startsWith('/projects/bulk') ? '/projects/bulk' : '/projects'

  // URL パラメータから projectClass の選択状態を復元する
  const selectedProjectClasses = searchParams.getAll('projectClass')
  const clientIdRef = useRef<HTMLInputElement>(null)
  const clientNameRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleClientSelect = useCallback((client: { clientId: number; clientName: string }) => {
    if (clientIdRef.current) {
      clientIdRef.current.value = String(client.clientId)
    }
    if (clientNameRef.current) {
      clientNameRef.current.value = client.clientName
    }
  }, [])

  const handleClientClear = useCallback(() => {
    if (clientIdRef.current) {
      clientIdRef.current.value = ''
    }
    if (clientNameRef.current) {
      clientNameRef.current.value = ''
    }
  }, [])

  /**
   * SearchParams を URLSearchParams に変換（buildPeriodSearchUrl に渡す用）
   */
  const currentSearchParams = new URLSearchParams(searchParams.toString())

  /**
   * 期間リンク用 URL を生成するラッパー（onClick 内でのみ呼ぶこと — formRef にアクセスする）
   */
  const periodUrl = (type: 'startThisYear' | 'endThisYear' | 'endLastYear') =>
    buildPeriodSearchUrl(type, formRef, formActionPath, currentSearchParams)

  /**
   * 期間リンクの onClick ハンドラ
   */
  const handlePeriodClick =
    (type: 'startThisYear' | 'endThisYear' | 'endLastYear') => (e: React.MouseEvent) => {
      e.preventDefault()
      router.push(periodUrl(type))
    }

  /**
   * ランクチェックボックス変更時に親フォームを自動送信する。
   *
   * SideMenu.js: `$('.checkbox').change(function(){ $(this).parents('form').submit(); })`
   */
  const handleCheckboxChange = () => {
    if (formRef.current) {
      formRef.current.requestSubmit()
    }
  }

  return (
    <div className="container-fluid mainContents">
      <div className="row">
        {/* sidemenu.jsp: nav.col-md-2.menu */}
        <nav className="col-md-2 menu">
          <div className="card">
            <div className="card-body">
              <ul>
                <li>
                  <div className="sideMenu">
                    <h4 className="text-muted fs-4 mb-3">
                      <strong>プロジェクトをさがす</strong>
                    </h4>
                    <form
                      ref={formRef}
                      method="GET"
                      action={formActionPath}
                      key={searchParams.toString()}
                    >
                      {/* sidemenu.jsp: hidden フィールド（検索ボタン押下時に期間・ソート条件を保持） */}
                      <input
                        type="hidden"
                        name="sortKey"
                        value={searchParams.get('sortKey') ?? ''}
                      />
                      <input
                        type="hidden"
                        name="sortDir"
                        value={searchParams.get('sortDir') ?? ''}
                      />
                      <input
                        type="hidden"
                        name="projectStartDateBegin"
                        value={searchParams.get('projectStartDateBegin') ?? ''}
                      />
                      <input
                        type="hidden"
                        name="projectStartDateEnd"
                        value={searchParams.get('projectStartDateEnd') ?? ''}
                      />
                      <input
                        type="hidden"
                        name="projectEndDateBegin"
                        value={searchParams.get('projectEndDateBegin') ?? ''}
                      />
                      <input
                        type="hidden"
                        name="projectEndDateEnd"
                        value={searchParams.get('projectEndDateEnd') ?? ''}
                      />
                      {/* sidemenu.jsp: 検索結果の表示ページ番号を指定する */}
                      <input type="hidden" name="pageNumber" value="1" />

                      <ul>
                        <li>
                          <span className="text-primary">ランクからさがす</span>
                          <ul>
                            {Object.entries(PROJECT_CLASS).map(([value, label]) => (
                              <li key={value}>
                                <div className="checkbox form-check">
                                  <label className="form-check-label form-control-lg">
                                    <input
                                      type="checkbox"
                                      name="projectClass"
                                      className="form-check-input"
                                      value={value}
                                      defaultChecked={selectedProjectClasses.includes(value)}
                                      onChange={handleCheckboxChange}
                                    />
                                    {label}
                                  </label>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li className="mb-3">
                          <span className="text-primary">期間からさがす</span>
                          <ul>
                            {/* 元 JSP は <n:a> を使用。<a> タグにすることで右クリック→新しいタブで開くを維持 */}
                            <li className="py-2">
                              <a href="#" onClick={handlePeriodClick('startThisYear')}>
                                <span className="text-muted fs-5 ps-3">今年開始</span>
                              </a>
                            </li>
                            <li className="py-2">
                              <a href="#" onClick={handlePeriodClick('endThisYear')}>
                                <span className="text-muted fs-5 ps-3">今年終了</span>
                              </a>
                            </li>
                            <li className="py-2">
                              <a href="#" onClick={handlePeriodClick('endLastYear')}>
                                <span className="text-muted fs-5 ps-3">昨年までに終了</span>
                              </a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                      <fieldset>
                        <div>
                          <div className="form-group label-static mb-3">
                            <div className="mb-2">
                              <label htmlFor="client-name" className="control-label mb-3">
                                顧客名
                              </label>
                              <input
                                ref={clientIdRef}
                                id="client-id"
                                name="clientId"
                                readOnly
                                className="form-control form-control-lg mb-2"
                                placeholder="顧客ID"
                                defaultValue={searchParams.get('clientId') ?? ''}
                              />
                              <input
                                ref={clientNameRef}
                                id="client-name"
                                name="clientName"
                                readOnly
                                className="form-control form-control-lg"
                                placeholder="顧客名"
                                defaultValue={searchParams.get('clientName') ?? ''}
                              />
                            </div>
                            <div className="text-end">
                              <button
                                type="button"
                                className="badge rounded-pill text-dark bg-body-secondary border-0"
                                onClick={() => setIsClientModalOpen(true)}
                              >
                                <i className="material-icons">search</i>
                              </button>
                              <button
                                type="button"
                                className="badge rounded-pill text-dark bg-body-secondary border-0"
                                onClick={handleClientClear}
                              >
                                <i className="material-icons">remove</i>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="form-group mb-3">
                            <label htmlFor="projectName" className="control-label mb-3">
                              プロジェクト名
                            </label>
                            <div>
                              <input
                                id="projectName"
                                name="projectName"
                                maxLength={64}
                                className="form-control form-control-lg"
                                placeholder="プロジェクト名"
                                defaultValue={searchParams.get('projectName') ?? ''}
                              />
                              {/* sidemenu.jsp: <n:error errorCss="message-error" name="searchForm.projectName" /> */}
                              <span className="message-error" />
                            </div>
                          </div>
                        </div>
                        <div className="d-flex justify-content-center">
                          <input type="submit" className="btn btn-lg btn-primary" value="検索" />
                        </div>
                      </fieldset>
                    </form>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* sidemenu.jsp: 顧客検索モーダル */}
          <ClientSearchModal
            isOpen={isClientModalOpen}
            onClose={() => setIsClientModalOpen(false)}
            onSelect={handleClientSelect}
          />
        </nav>

        {/* メインコンテンツ: div.pages.col-md-10 */}
        <div className="pages col-md-10">{children}</div>
      </div>
    </div>
  )
}
