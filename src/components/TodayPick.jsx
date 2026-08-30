import hyangeohoeImg from '../assets/hyangeohoe.jpg'
import maeuntangImg from '../assets/maeuntang.jpg'
import Calendar from './Calendar'
import './Calendar.css'
import './TodayPick.css'

const DISHES = [
  { name: '향어회', price: '35,000원', image: hyangeohoeImg },
  { name: '매운탕', price: '29,000원', image: maeuntangImg },
]

export default function TodayPick({ onSelectDate }) {
  return (
    <section className="today-pick" id="menu">
      <div className="section-grid">
        <div className="pick-col">
          <h2 className="section-title">오늘의 추천</h2>
          <p className="section-sub">신선한 자연의 재료로 정성껏 지어낸 민물고기 요리입니다.</p>

          <div className="dish-list">
            {DISHES.map(({ name, price, image }) => (
              <div className="dish-card" key={name}>
                <div className="dish-thumb">
                  <img src={image} alt={name} />
                </div>
                <p className="dish-name">{name}</p>
                <p className="dish-price">{price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="reserve-col" id="reservation">
          <h2 className="section-title">예약 현황</h2>
          <p className="section-sub">날짜를 클릭하면 예약 팝업이 열립니다.</p>
          <Calendar busyDates={[12, 13, 14, 15, 16]} onSelectDate={onSelectDate} />
        </div>
      </div>
    </section>
  )
}
