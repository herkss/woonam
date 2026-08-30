import { useEffect, useState } from 'react'
import { cancelReservation, lookupReservations, updateReservation } from '../lib/api'
import { useOtp } from '../lib/useOtp'
import './ReservationModal.css'
import './ReservationManage.css'

const PHONE_RE = /^01[016789]\d{7,8}$/
const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const totalMin = 11 * 60 + i * 30
  const h = String(Math.floor(totalMin / 60)).padStart(2, '0')
  const m = String(totalMin % 60).padStart(2, '0')
  return `${h}:${m}`
})
const MENU_OPTIONS = ['향어회', '매운탕', '기타(전화 문의)']

export default function ReservationManage({ onClose }) {
  const [mode, setMode] = useState('pin') // 'pin' | 'otp'
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const otp = useOtp('manage')

  const [reservations, setReservations] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [pendingAction, setPendingAction] = useState(null) // { id, type: 'update'|'cancel' }
  const [actionError, setActionError] = useState('')

  const phoneDigits = phone.replace(/\D/g, '')
  const phoneValid = PHONE_RE.test(phoneDigits)
  const canLookup = phoneValid && (mode === 'pin' ? /^\d{4,6}$/.test(pin) : Boolean(otp.verifyToken))

  async function handleLookup(e) {
    e.preventDefault()
    if (!canLookup) return
    setLoading(true)
    setLookupError('')
    try {
      const res = await lookupReservations(
        mode === 'pin' ? { phone: phoneDigits, pin } : { phone: phoneDigits, verifyToken: otp.verifyToken },
      )
      setReservations(res.reservations)
      if (mode === 'otp') otp.reset()
    } catch (err) {
      setLookupError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function credentialFor(payload) {
    return mode === 'pin' ? { ...payload, phone: phoneDigits, pin } : { ...payload, phone: phoneDigits, verifyToken: otp.verifyToken }
  }

  async function runUpdate(id, fields) {
    setActionError('')
    try {
      const res = await updateReservation(id, credentialFor(fields))
      setReservations((list) => list.map((r) => (r.id === id ? res.reservation : r)))
      setEditingId(null)
      setDraft(null)
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function runCancel(id) {
    setActionError('')
    try {
      await cancelReservation(id, credentialFor({}))
      setReservations((list) => list.filter((r) => r.id !== id))
    } catch (err) {
      setActionError(err.message)
    }
  }

  useEffect(() => {
    if (mode !== 'otp' || !pendingAction || !otp.verifyToken) return
    const { id, type, fields } = pendingAction
    setPendingAction(null)
    if (type === 'update') runUpdate(id, fields)
    else runCancel(id)
    otp.reset()
    setOtpCode('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp.verifyToken])

  function startEdit(r) {
    setEditingId(r.id)
    setDraft({ date: r.date, time: r.time, partySize: r.partySize, menu: r.menu })
  }

  function requestSaveEdit(id) {
    if (mode === 'pin') {
      runUpdate(id, draft)
    } else {
      setPendingAction({ id, type: 'update', fields: draft })
      otp.send(phoneDigits)
    }
  }

  function requestCancel(id) {
    if (!window.confirm('이 예약을 취소하시겠습니까?')) return
    if (mode === 'pin') {
      runCancel(id)
    } else {
      setPendingAction({ id, type: 'cancel', fields: {} })
      otp.send(phoneDigits)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel manage-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" aria-label="닫기" onClick={onClose}>
          &times;
        </button>
        <h3 className="modal-title">예약 확인 / 변경</h3>

        {!reservations ? (
          <form className="modal-form" onSubmit={handleLookup}>
            <div className="manage-tabs">
              <button
                type="button"
                className={mode === 'pin' ? 'active' : ''}
                onClick={() => setMode('pin')}
              >
                비밀번호로 확인
              </button>
              <button
                type="button"
                className={mode === 'otp' ? 'active' : ''}
                onClick={() => setMode('otp')}
              >
                문자 인증으로 확인
              </button>
            </div>

            <label>
              휴대폰 번호
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  otp.reset()
                }}
                placeholder="01012345678"
                inputMode="numeric"
              />
            </label>

            {mode === 'pin' ? (
              <label>
                예약 시 설정한 비밀번호
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                />
              </label>
            ) : (
              <>
                <div className="form-inline">
                  <button
                    type="button"
                    className="btn btn-outline-sm"
                    disabled={!phoneValid || otp.sending || otp.cooldown > 0}
                    onClick={() => otp.send(phoneDigits)}
                  >
                    {otp.cooldown > 0 ? `${otp.cooldown}초` : otp.sent ? '재전송' : '인증번호 받기'}
                  </button>
                </div>
                {otp.sent && !otp.verifyToken && (
                  <label>
                    인증번호
                    <div className="form-inline">
                      <input
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        inputMode="numeric"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-sm"
                        disabled={otpCode.length !== 6 || otp.verifying}
                        onClick={() => otp.confirm(phoneDigits, otpCode)}
                      >
                        확인
                      </button>
                    </div>
                  </label>
                )}
                {otp.verifyToken && <p className="form-hint success">인증 완료</p>}
                {otp.error && <p className="form-hint error">{otp.error}</p>}
              </>
            )}

            {lookupError && <p className="form-hint error">{lookupError}</p>}

            <button type="submit" className="btn btn-primary" disabled={!canLookup || loading}>
              {loading ? '조회 중...' : '조회하기'}
            </button>
          </form>
        ) : (
          <div className="manage-list">
            {actionError && <p className="form-hint error">{actionError}</p>}
            {reservations.length === 0 && <p className="modal-existing-empty">예약 내역이 없습니다</p>}

            {reservations.map((r) => (
              <div className="manage-card" key={r.id}>
                {editingId === r.id ? (
                  <>
                    <div className="form-row">
                      <label>
                        인원
                        <select
                          value={draft.partySize}
                          onChange={(e) => setDraft((d) => ({ ...d, partySize: Number(e.target.value) }))}
                        >
                          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}명
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        시간
                        <select value={draft.time} onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}>
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label>
                      날짜
                      <input
                        type="date"
                        value={draft.date}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                      />
                    </label>
                    <label>
                      메뉴
                      <select value={draft.menu} onChange={(e) => setDraft((d) => ({ ...d, menu: e.target.value }))}>
                        {MENU_OPTIONS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </label>

                    {mode === 'otp' && pendingAction?.id === r.id && (
                      <div className="manage-otp-confirm">
                        <p className="form-hint">본인 확인을 위해 문자로 받은 인증번호를 입력해주세요</p>
                        <div className="form-inline">
                          <input
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            inputMode="numeric"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-sm"
                            disabled={otpCode.length !== 6 || otp.verifying}
                            onClick={() => otp.confirm(phoneDigits, otpCode)}
                          >
                            확인
                          </button>
                        </div>
                        {otp.error && <p className="form-hint error">{otp.error}</p>}
                      </div>
                    )}

                    <div className="manage-card-actions">
                      <button type="button" className="btn btn-primary" onClick={() => requestSaveEdit(r.id)}>
                        저장
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-sm"
                        onClick={() => {
                          setEditingId(null)
                          setDraft(null)
                          setPendingAction(null)
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="manage-card-line">
                      {r.date} {r.time} · {r.partySize}명 · {r.menu}
                    </p>
                    <p className="manage-card-sub">{r.name}</p>

                    {mode === 'otp' && pendingAction?.id === r.id && (
                      <div className="manage-otp-confirm">
                        <p className="form-hint">본인 확인을 위해 문자로 받은 인증번호를 입력해주세요</p>
                        <div className="form-inline">
                          <input
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            inputMode="numeric"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-sm"
                            disabled={otpCode.length !== 6 || otp.verifying}
                            onClick={() => otp.confirm(phoneDigits, otpCode)}
                          >
                            확인
                          </button>
                        </div>
                        {otp.error && <p className="form-hint error">{otp.error}</p>}
                      </div>
                    )}

                    <div className="manage-card-actions">
                      <button type="button" className="btn btn-outline-sm" onClick={() => startEdit(r)}>
                        수정
                      </button>
                      <button type="button" className="btn btn-outline-sm" onClick={() => requestCancel(r.id)}>
                        예약 취소
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
