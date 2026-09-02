import { useEffect, useState } from 'react'
import { fetchNotices } from '../lib/api'
import { NoticeArt } from './FoodArt'
import './ReservationModal.css'
import './Notices.css'

const RESERVATIONS = [
  { title: '단체 예약 문의는 전화로 부탁드립니다', when: '1일 전' },
  { title: '주말 저녁 예약이 빠르게 마감되고 있습니다', when: '3일 전' },
  { title: '온라인 예약 시 좌석은 자동 배정됩니다', when: '7일 전' },
]

export default function Notices({ admin, onOpenNoticeManage, noticeVersion }) {
  const [notices, setNotices] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchNotices()
      .then((res) => {
        if (!cancelled) setNotices(res.notices)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [noticeVersion])

  return (
    <section className="notices" id="notices">
      <div className="section-grid">
        <div>
          <div className="notice-head">
            <h2 className="section-title">공지사항 및 이벤트</h2>
            {admin?.isAdmin ? (
              <button type="button" className="btn btn-outline-sm" onClick={onOpenNoticeManage}>
                공지사항 관리
              </button>
            ) : (
              <div className="carousel-arrows">
                <button type="button" aria-label="이전">
                  &#8249;
                </button>
                <button type="button" aria-label="다음">
                  &#8250;
                </button>
              </div>
            )}
          </div>

          <div className="notice-list">
            {notices.length === 0 && <p className="modal-existing-empty">등록된 공지사항이 없습니다</p>}
            {notices.map((n, i) => (
              <div className="notice-card" key={n.id}>
                <div className="notice-thumb">
                  <NoticeArt tone={i % 2 === 0 ? 'a' : 'b'} />
                </div>
                <div className="notice-body">
                  <p className="notice-title">{n.title}</p>
                  <p className="notice-date">{n.dateLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="notice-head">
            <h2 className="section-title">예약</h2>
            <a href="#reservation" className="link-more">
              예약보기 &#8250;
            </a>
          </div>

          <ul className="reservation-list">
            {RESERVATIONS.map((r) => (
              <li key={r.title}>
                <span className="rl-title">{r.title}</span>
                <span className="rl-when">{r.when}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
