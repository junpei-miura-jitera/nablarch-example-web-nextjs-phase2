const PERIOD_LINKS = [
  { label: '今年開始', type: 'startThisYear' },
  { label: '今年終了', type: 'endThisYear' },
  { label: '昨年までに終了', type: 'endLastYear' },
] as const

export function ProjectPeriodLinks({
  onClick,
}: {
  onClick: (type: 'startThisYear' | 'endThisYear' | 'endLastYear') => (event: React.MouseEvent) => void
}) {
  return (
    <li className="mb-3">
      <span className="text-primary">期間からさがす</span>
      <ul>
        {PERIOD_LINKS.map(({ label, type }) => (
          <li key={type} className="py-2">
            <a id={type} href="#" onClick={onClick(type)}>
              <span className="text-muted fs-5 ps-3">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </li>
  )
}
