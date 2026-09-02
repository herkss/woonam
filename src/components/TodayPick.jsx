import { useEffect, useState } from 'react'
import { fetchMenuItems } from '../lib/api'
import { SashimiArt } from './FoodArt'
import Calendar from './Calendar'
import MenuDetailModal from './MenuDetailModal'
import './Calendar.css'
import './ReservationModal.css'
import './TodayPick.css'

export default function TodayPick({
  onSelectDate,
  onAdminSelectDate,
  admin,
  onOpenMenuManage,
  menuVersion,
}) {
  const [dishes, setDishes] = useState([])
  const [selectedDish, setSelectedDish] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchMenuItems()
      .then((res) => {
        if (!cancelled) setDishes(res.items)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [menuVersion])

  return (
    <section className="today-pick" id="menu">
      <div className="menu-block">
        <div className="pick-col-head">
          <h2 className="section-title">메뉴</h2>
          {admin.isAdmin && (
            <button type="button" className="btn btn-outline-sm" onClick={onOpenMenuManage}>
              메뉴 관리
            </button>
          )}
        </div>
        <p className="section-sub">신선한 자연의 재료로 정성껏 지어낸 민물고기 요리입니다.</p>

        {dishes.length === 0 ? (
          <p className="modal-existing-empty">등록된 메뉴가 없습니다</p>
        ) : (
          <div className="dish-list">
            {dishes.map((dish) => (
              <button
                type="button"
                className="dish-card"
                key={dish.id}
                onClick={() => setSelectedDish(dish)}
              >
                <div className="dish-thumb">
                  {dish.imageUrl ? <img src={dish.imageUrl} alt={dish.name} /> : <SashimiArt />}
                </div>
                <p className="dish-name">{dish.name}</p>
                <p className="dish-price">{dish.priceLabel}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="reserve-block" id="reservation">
        <h2 className="section-title">예약 현황</h2>
        <p className="section-sub">날짜를 클릭하면 예약 팝업이 열립니다.</p>
        <Calendar onSelectDate={onSelectDate} onAdminSelectDate={onAdminSelectDate} admin={admin} />
      </div>

      {selectedDish && <MenuDetailModal dish={selectedDish} onClose={() => setSelectedDish(null)} />}
    </section>
  )
}
