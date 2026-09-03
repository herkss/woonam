import { useEffect, useState } from 'react'
import { fetchGalleryImages } from '../lib/api'
import GalleryDetailModal from './GalleryDetailModal'
import './ReservationModal.css'
import './Gallery.css'

export default function Gallery({ admin, onOpenGalleryManage, galleryVersion }) {
  const [images, setImages] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchGalleryImages()
      .then((res) => {
        if (!cancelled) setImages(res.images)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [galleryVersion])

  return (
    <section className="gallery" id="gallery">
      <div className="gallery-head">
        <h2 className="section-title">갤러리</h2>
        {admin?.isAdmin && (
          <button type="button" className="btn btn-outline-sm" onClick={onOpenGalleryManage}>
            갤러리 관리
          </button>
        )}
      </div>
      <p className="section-sub">매장과 음식의 다양한 모습을 만나보세요.</p>

      {images.length === 0 ? (
        <p className="modal-existing-empty">등록된 사진이 없습니다</p>
      ) : (
        <div className="gallery-grid">
          {images.map((img) => (
            <figure
              className="gallery-item"
              key={img.id}
              onClick={() => setSelected(img)}
            >
              <img src={img.imageUrl} alt={img.title || '매장 사진'} />
              {(img.title || img.content) && (
                <figcaption>
                  {img.title && <span className="gallery-item-title">{img.title}</span>}
                  {img.content && <span className="gallery-item-content">{img.content}</span>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {selected && <GalleryDetailModal image={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
