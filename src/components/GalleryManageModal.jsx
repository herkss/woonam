import { useEffect, useState } from 'react'
import { fetchGalleryImages, createGalleryImage, deleteGalleryImage } from '../lib/api'
import { fileToResizedDataUrl } from '../lib/image'
import './ReservationModal.css'
import './ManageModal.css'
import './GalleryManageModal.css'

export default function GalleryManageModal({ adminToken, onClose, onChanged }) {
  const [images, setImages] = useState(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  function load() {
    fetchGalleryImages()
      .then((res) => setImages(res.images))
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return

    setError('')
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(files.length > 1 ? `${i + 1}/${files.length}장 업로드 중...` : '업로드 중...')
        const dataUrl = await fileToResizedDataUrl(files[i])
        await createGalleryImage({ imageUrl: dataUrl }, adminToken)
      }
      load()
      onChanged?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setUploadProgress('')
    }
  }

  async function handleDelete(img) {
    if (!window.confirm('이 사진을 삭제하시겠습니까?')) return
    setError('')
    try {
      await deleteGalleryImage(img.id, adminToken)
      load()
      onChanged?.()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" aria-label="닫기" onClick={onClose}>
          &times;
        </button>

        <h3 className="modal-title">갤러리 관리</h3>

        <label className={`btn btn-primary btn-full gallery-upload-btn ${uploading ? 'disabled' : ''}`}>
          {uploading ? uploadProgress || '업로드 중...' : '+ 사진 추가 (여러 장 선택 가능)'}
          <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={uploading} hidden />
        </label>

        {error && <p className="form-hint error">{error}</p>}
        {!images && !error && <p className="modal-existing-empty">불러오는 중...</p>}
        {images && images.length === 0 && <p className="modal-existing-empty">등록된 사진이 없습니다</p>}

        {images && images.length > 0 && (
          <div className="gallery-manage-grid">
            {images.map((img) => (
              <div className="gallery-manage-item" key={img.id}>
                <img src={img.imageUrl} alt="" />
                <button type="button" className="gallery-manage-delete" onClick={() => handleDelete(img)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
