import { SashimiArt } from './FoodArt'
import './ReservationModal.css'
import './MenuDetailModal.css'

export default function MenuDetailModal({ dish, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel menu-detail-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" aria-label="닫기" onClick={onClose}>
          &times;
        </button>

        <div className="menu-detail-thumb">
          {dish.imageUrl ? <img src={dish.imageUrl} alt={dish.name} /> : <SashimiArt />}
        </div>

        <h3 className="modal-title">{dish.name}</h3>
        <p className="menu-detail-price">{dish.priceLabel}</p>
        {dish.description && <p className="menu-detail-desc">{dish.description}</p>}
      </div>
    </div>
  )
}
