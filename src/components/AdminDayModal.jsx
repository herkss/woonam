import { useEffect, useState } from 'react'
import { fetchAdminReservations } from '../lib/api'
import { toDateKey, formatDateKorean } from '../lib/dates'
import './ReservationModal.css'
import './AdminDayModal.css'

const STATUS_LABEL = {
  confirmed: '예약중',
  cancelled: '취소됨',
}

export default function AdminDayModal({ date, adminToken, onClose }) {
  const dateKey = toDateKey(date)
  const [reservations, setReservations] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setReservations(null)
    setError('')
    fetchAdminReservations(dateKey, adminToken)
      .then((res) => {
        if (!cancelled) setReservations(res.reservations)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [dateKey, adminToken])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" aria-label="닫기" onClick={onClose}>
          &times;
        </button>

        <h3 className="modal-title">{formatDateKorean(date)} 전체 예약 (점주용)</h3>

        {error && <p className="form-hint error">{error}</p>}

        {!error && !reservations && <p className="modal-existing-empty">불러오는 중...</p>}

        {reservations && reservations.length === 0 && (
          <p className="modal-existing-empty">이 날짜에는 예약이 없습니다</p>
        )}

        {reservations && reservations.length > 0 && (
          <ul className="admin-day-list">
            {reservations.map((r) => (
              <li key={r.id} className={`admin-day-card status-${r.status}`}>
                <div className="admin-day-card-main">
                  <span className="admin-day-time">{r.timeLabel}</span>
                  <span className="admin-day-status">{STATUS_LABEL[r.status] || r.status}</span>
                </div>
                <p className="admin-day-name">
                  {r.name} · {r.partySize}명 · {r.menu}
                </p>
                <a className="admin-day-phone" href={`tel:${r.phone}`}>
                  {r.phone} (전화 연결)
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
