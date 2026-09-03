import './ReservationModal.css'
import './GalleryDetailModal.css'

export default function GalleryDetailModal({ image, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel gallery-detail-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" aria-label="닫기" onClick={onClose}>
          &times;
        </button>

        <div className="gallery-detail-image">
          <img src={image.imageUrl} alt={image.title || '매장 사진'} />
        </div>

        {(image.title || image.content) && (
          <div className="gallery-detail-body">
            {image.title && <h3 className="modal-title">{image.title}</h3>}
            {image.content && <p className="gallery-detail-content">{image.content}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
