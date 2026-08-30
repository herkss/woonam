// 예약자명단 등 공개 화면에 노출되는 이름/전화번호 마스킹 유틸.
// 프론트엔드(src)와 백엔드(functions/_shared)에서 상대경로로 함께 import 해서 사용합니다.

export function maskName(name) {
  const chars = Array.from(String(name || '').trim())
  if (chars.length <= 1) return chars.join('')
  if (chars.length === 2) return `${chars[0]}x`
  return `${chars[0]}${'x'.repeat(chars.length - 2)}${chars[chars.length - 1]}`
}

// 010-2337-2347 -> 010-2xx7-23x7
export function maskPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length !== 10 && digits.length !== 11) return phone

  const p1 = digits.slice(0, 3)
  const mid = digits.length === 11 ? digits.slice(3, 7) : digits.slice(3, 6)
  const last = digits.length === 11 ? digits.slice(7, 11) : digits.slice(6, 10)

  const maskedMid =
    mid.length === 4
      ? `${mid[0]}xx${mid[3]}`
      : `${mid[0]}x${mid[2]}`
  const maskedLast = `${last[0]}${last[1]}x${last[3]}`

  return `${p1}-${maskedMid}-${maskedLast}`
}

export function formatTimeLabel(time) {
  const [h, m] = String(time || '').split(':').map(Number)
  if (Number.isNaN(h)) return time
  const h12 = h % 12 === 0 ? 12 : h % 12
  return m ? `${h12}시${m}분` : `${h12}시`
}

export function formatPartyLabel(partySize) {
  return `${partySize}명`
}

// "김x자,010-2xx7-23x7,7명,5시" 형태의 표시용 라인
export function formatReservationLine({ name, phone, partySize, time }) {
  return [maskName(name), maskPhone(phone), formatPartyLabel(partySize), formatTimeLabel(time)].join(',')
}
