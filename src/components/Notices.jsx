import { NoticeArt } from './FoodArt'
import './Notices.css'

const NOTICES = [
  { title: '일요일 정기 휴무 안내', date: '2026.08.20', tone: 'a' },
  { title: '추석 연휴 영업시간 변경 안내', date: '2026.08.14', tone: 'b' },
]

const RESERVATIONS = [
  { title: '단체 예약 문의는 전화로 부탁드립니다', when: '1일 전' },
  { title: '주말 저녁 예약이 빠르게 마감되고 있습니다', when: '3일 전' },
  { title: '온라인 예약 시 좌석은 자동 배정됩니다', when: '7일 전' },
]

export default function Notices() {
  return (
    <section className="notices" id="gallery">
      <div className="section-grid">
        <div>
          <div className="notice-head">
            <h2 className="section-title">공지사항 및 이벤트</h2>
            <div className="carousel-arrows">
              <button type="button" aria-label="이전">
                &#8249;
              </button>
              <button type="button" aria-label="다음">
                &#8250;
              </button>
            </div>
          </div>

          <div className="notice-list">
            {NOTICES.map((n) => (
              <div className="notice-card" key={n.title}>
                <div className="notice-thumb">
                  <NoticeArt tone={n.tone} />
                </div>
                <div className="notice-body">
                  <p className="notice-title">{n.title}</p>
                  <p className="notice-date">{n.date}</p>
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
