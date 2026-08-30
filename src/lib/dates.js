export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isPastDay(date, today = new Date()) {
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return a < b
}

export function formatDateKorean(date) {
  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`
}
