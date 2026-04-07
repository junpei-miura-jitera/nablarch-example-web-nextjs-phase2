export function ProjectNameFilter({
  defaultValue,
  errorMessage,
}: {
  defaultValue: string
  errorMessage?: string
}) {
  return (
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
            className={`form-control form-control-lg${errorMessage ? ' input-error' : ''}`}
            placeholder="プロジェクト名"
            defaultValue={defaultValue}
          />
          <span className="message-error">{errorMessage ?? ''}</span>
        </div>
      </div>
    </div>
  )
}
