import { useMemo, useState } from 'react'

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

export default function Calendar({ busyDates = [], initialDate = new Date() }) {
  const [cursor, setCursor] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  )

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const today = initialDate

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])

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
        <span>
          {year}년 {month + 1}월
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
          const busy = d && busyDates.includes(d)
          return (
            <span
              key={i}
              className={[
                'cal-cell',
                d ? '' : 'empty',
                col === 0 ? 'sun' : col === 6 ? 'sat' : '',
                isToday(d) ? 'today' : '',
                busy ? 'busy' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {d || ''}
            </span>
          )
        })}
      </div>
    </div>
  )
}
