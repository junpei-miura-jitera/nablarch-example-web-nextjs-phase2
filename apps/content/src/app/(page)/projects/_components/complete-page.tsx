type ProjectCompletePageViewProps = {
  title: string
  message: string
  onNext?: () => void
  topNextId?: string
  bottomNextId?: string
  messageClassName?: string
  wrapMessageWithSection?: boolean
}

/**
 * 完了画面の共通表示部品。
 *
 * ナビゲーション処理は呼び出し側に委譲し、Storybook では純粋な表示コンポーネントとして扱う。
 */
export function ProjectCompletePageView({
  title,
  message,
  onNext,
  topNextId,
  bottomNextId,
  messageClassName = 'message-area',
  wrapMessageWithSection = false,
}: ProjectCompletePageViewProps) {
  const messageNode = <div className={messageClassName}>{message}</div>

  return (
    <>
      <div className="title-nav">
        <span className="page-title">{title}</span>
        <div className="button-nav">
          <div className="button-block link-button-block">
            <a
              id={topNextId}
              href="#"
              onClick={(event) => {
                event.preventDefault()
                onNext?.()
              }}
              className="btn btn-lg btn-success"
            >
              次へ
            </a>
          </div>
        </div>
      </div>
      {wrapMessageWithSection ? <section>{messageNode}</section> : messageNode}
      <div className="title-nav">
        <div className="button-nav">
          <div className="button-block link-button-block">
            <a
              id={bottomNextId}
              href="#"
              onClick={(event) => {
                event.preventDefault()
                onNext?.()
              }}
              className="btn btn-lg btn-success"
            >
              次へ
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
