import { useEffect, useState } from 'react'
import { createReservation, fetchReservationsByDate } from '../lib/api'
import { toDateKey, formatDateKorean } from '../lib/dates'
import { useOtp } from '../lib/useOtp'
import './ReservationModal.css'

const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const totalMin = 11 * 60 + i * 30 // 11:00 ~ 20:30
  const h = String(Math.floor(totalMin / 60)).padStart(2, '0')
  const m = String(totalMin % 60).padStart(2, '0')
  return `${h}:${m}`
})

const MENU_OPTIONS = ['향어회', '매운탕', '기타(전화 문의)']

const PHONE_RE = /^01[016789]\d{7,8}$/

export default function ReservationModal({ date, onClose }) {
  const dateKey = toDateKey(date)
  const otp = useOtp('booking')

  const [existing, setExisting] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  const [partySize, setPartySize] = useState(2)
  const [time, setTime] = useState('')
  const [menu, setMenu] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [pin, setPin] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoadingList(true)
    fetchReservationsByDate(dateKey)
      .then((res) => {
        if (!cancelled) setExisting(res.reservations)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingList(false)
      })
    return () => {
      cancelled = true
    }
  }, [dateKey])

  const phoneDigits = phone.replace(/\D/g, '')
  const phoneValid = PHONE_RE.test(phoneDigits)
  const pinValid = /^\d{4,6}$/.test(pin)
  const canSubmit =
    time && menu && name.trim() && phoneValid && pinValid && otp.verifyToken && !submitting

  function changePhone(value) {
    setPhone(value)
    if (otp.sent || otp.verifyToken) otp.reset()
    setOtpCode('')
  }

  async function handleSendOtp() {
    if (!phoneValid) return
    await otp.send(phoneDigits)
  }

  async function handleVerifyOtp() {
    if (otpCode.length !== 6) return
    await otp.confirm(phoneDigits, otpCode)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await createReservation({
        date: dateKey,
        time,
        partySize,
        menu,
        name: name.trim(),
        phone: phoneDigits,
        pin,
        verifyToken: otp.verifyToken,
      })
      setResult(res.reservation)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" aria-label="닫기" onClick={onClose}>
          &times;
        </button>

        {result ? (
          <div className="modal-success">
            <h3>예약이 완료되었습니다</h3>
            <p className="modal-success-line">
              {formatDateKorean(date)} {result.time} · {result.partySize}명 · {result.menu}
            </p>
            <p className="modal-success-note">
              설정하신 비밀번호로 홈페이지의 &lsquo;예약 확인/변경&rsquo;에서 예약 내역을 확인하거나 변경할 수
              있습니다.
            </p>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              확인
            </button>
          </div>
        ) : (
          <>
            <h3 className="modal-title">{formatDateKorean(date)} 예약</h3>

            <div className="modal-existing">
              <p className="modal-existing-label">이 날짜의 예약 현황</p>
              {loadingList ? (
                <p className="modal-existing-empty">불러오는 중...</p>
              ) : existing.length === 0 ? (
                <p className="modal-existing-empty">아직 예약이 없습니다</p>
              ) : (
                <ul className="modal-existing-list">
                  {existing.map((r, i) => (
                    <li key={i}>{r.line}</li>
                  ))}
                </ul>
              )}
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>
                  인원
                  <select value={partySize} onChange={(e) => setPartySize(Number(e.target.value))}>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}명
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  시간
                  <select value={time} onChange={(e) => setTime(e.target.value)}>
                    <option value="">선택</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                메뉴
                <select value={menu} onChange={(e) => setMenu(e.target.value)}>
                  <option value="">선택</option>
                  {MENU_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                예약자 이름
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
              </label>

              <label>
                휴대폰 번호
                <div className="form-inline">
                  <input
                    value={phone}
                    onChange={(e) => changePhone(e.target.value)}
                    placeholder="01012345678"
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-sm"
                    disabled={!phoneValid || otp.sending || otp.cooldown > 0}
                    onClick={handleSendOtp}
                  >
                    {otp.cooldown > 0 ? `${otp.cooldown}초` : otp.sent ? '재전송' : '인증번호 받기'}
                  </button>
                </div>
              </label>

              {otp.sent && !otp.verifyToken && (
                <label>
                  인증번호
                  <div className="form-inline">
                    <input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6자리 숫자"
                      inputMode="numeric"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-sm"
                      disabled={otpCode.length !== 6 || otp.verifying}
                      onClick={handleVerifyOtp}
                    >
                      확인
                    </button>
                  </div>
                </label>
              )}

              {otp.verifyToken && <p className="form-hint success">문자 인증이 완료되었습니다</p>}
              {otp.error && <p className="form-hint error">{otp.error}</p>}

              <label>
                확인용 비밀번호 (4~6자리 숫자)
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="예약 확인/변경 시 사용"
                  inputMode="numeric"
                />
              </label>

              {submitError && <p className="form-hint error">{submitError}</p>}

              <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                {submitting ? '예약 중...' : '예약하기'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
