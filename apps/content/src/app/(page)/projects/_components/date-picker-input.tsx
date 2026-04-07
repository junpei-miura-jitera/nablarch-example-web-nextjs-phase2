'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function parseSlashDate(value: string) {
  const match = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? null : date
}

function formatSlashDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

function buildCalendarDates(visibleMonth: Date) {
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)
    return date
  })
}

export const DatePickerInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>
>(function DatePickerInput({ onFocus, onClick, onBlur, onChange, ...props }, forwardedRef) {
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => parseSlashDate(String(props.defaultValue ?? '')) ?? new Date())
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        forwardedRef.current = node
      }
    },
    [forwardedRef],
  )

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const calendarDates = useMemo(() => buildCalendarDates(visibleMonth), [visibleMonth])

  function openDatePicker() {
    const currentValue = inputRef.current?.value ?? ''
    setVisibleMonth(parseSlashDate(currentValue) ?? new Date())
    setIsOpen(true)
  }

  function commitValue(value: string) {
    if (!inputRef.current) return
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
    descriptor?.set?.call(inputRef.current, value)
    inputRef.current.dispatchEvent(new Event('input', { bubbles: true }))
    inputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
  }

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <input
        {...props}
        ref={setRefs}
        type="text"
        onFocus={(event) => {
          openDatePicker()
          onFocus?.(event)
        }}
        onClick={(event) => {
          openDatePicker()
          onClick?.(event)
        }}
        onBlur={onBlur}
        onChange={onChange}
      />

      {isOpen && (
        <div
          className="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"
          style={{ position: 'absolute', top: '100%', left: 0, zIndex: 20, display: 'block' }}
        >
          <div className="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all">
            <button
              type="button"
              className="ui-datepicker-prev"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
                )
              }
            >
              前
            </button>
            <div className="ui-datepicker-title">
              <span className="ui-datepicker-year">{visibleMonth.getFullYear()}</span>年
              <span className="ui-datepicker-month">{visibleMonth.getMonth() + 1}</span>月
            </div>
            <button
              type="button"
              className="ui-datepicker-next"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
                )
              }
            >
              次
            </button>
          </div>

          <table className="ui-datepicker-calendar">
            <thead>
              <tr>
                {WEEKDAYS.map((weekday) => (
                  <th key={weekday} scope="col">
                    <span title={weekday}>{weekday}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, weekIndex) => (
                <tr key={weekIndex}>
                  {calendarDates.slice(weekIndex * 7, weekIndex * 7 + 7).map((date) => {
                    const isOtherMonth = date.getMonth() !== visibleMonth.getMonth()
                    return (
                      <td
                        key={date.toISOString()}
                        className={isOtherMonth ? 'ui-datepicker-other-month' : undefined}
                      >
                        <button
                          type="button"
                          className="ui-state-default"
                          onClick={() => {
                            commitValue(formatSlashDate(date))
                            setIsOpen(false)
                          }}
                        >
                          {date.getDate()}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
})
