import { useEffect, useMemo, useState } from 'react'
import { isPastDay, toDateKey, toMonthKey } from '../lib/dates'
import { fetchReservedDatesInMonth } from '../lib/api'
import AdminAccessButton from './AdminAccessButton'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function Calendar({ initialDate = new Date(), onSelectDate, onAdminSelectDate, admin }) {
  const [cursor, setCursor] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  )
  const [reservedDates, setReservedDates] = useState(new Set())

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const today = initialDate

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])

  useEffect(() => {
    let cancelled = false
    fetchReservedDatesInMonth(toMonthKey(year, month))
      .then((res) => {
        if (!cancelled) setReservedDates(new Set(res.dates))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [year, month])

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const goPrev = () => setCursor(new Date(year, month - 1, 1))
  const goNext = () => setCursor(new Date(year, month + 1, 1))

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" aria-label="이전 달" onClick={goPrev}>
          &#8249;
        </button>
        <span className="calendar-header-title">
          <span>
            {year}년 {month + 1}월
          </span>
          <AdminAccessButton admin={admin} />
        </span>
        <button type="button" aria-label="다음 달" onClick={goNext}>
          &#8250;
        </button>
      </div>
      <div className="calendar-weekdays">
        {WEEKDAYS.map((w, i) => (
          <span key={w} className={i === 0 ? 'sun' : i === 6 ? 'sat' : ''}>
            {w}
          </span>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((d, i) => {
          const col = i % 7
          const cellDate = d ? new Date(year, month, d) : null
          const past = cellDate ? isPastDay(cellDate, today) : false
          const clickable = d && (admin.isAdmin ? onAdminSelectDate : !past && onSelectDate)
          const hasReservation = cellDate && reservedDates.has(toDateKey(cellDate))

          const handleClick = () => {
            if (admin.isAdmin) onAdminSelectDate(cellDate)
            else onSelectDate(cellDate)
          }

          return (
            <button
              type="button"
              key={i}
              disabled={!clickable}
              onClick={clickable ? handleClick : undefined}
              className={[
                'cal-cell',
                d ? '' : 'empty',
                col === 0 ? 'sun' : col === 6 ? 'sat' : '',
                isToday(d) ? 'today' : '',
                past ? 'past' : '',
                clickable ? 'clickable' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="cal-day-num">{d || ''}</span>
              <span
                className={[
                  'cal-dot',
                  hasReservation ? '' : 'hidden',
                  hasReservation && past ? 'muted' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={hasReservation ? '예약 있음' : undefined}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
