import { PROJECT_CLASS } from ':/app/(page)/projects/_utils/project-class'

export function ProjectClassFilter({
  selectedProjectClasses,
  onChange,
}: {
  selectedProjectClasses: string[]
  onChange: () => void
}) {
  return (
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
                  onChange={onChange}
                />
                {label}
              </label>
            </div>
          </li>
        ))}
      </ul>
    </li>
  )
}
