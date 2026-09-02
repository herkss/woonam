import { useEffect, useState } from 'react'
import { fetchGalleryImages, createGalleryImage, updateGalleryImage, deleteGalleryImage } from '../lib/api'
import { fileToResizedDataUrl } from '../lib/image'
import './ReservationModal.css'
import './ManageModal.css'

const emptyForm = { title: '', content: '', imageUrl: '' }

export default function GalleryManageModal({ adminToken, onClose, onChanged }) {
  const [images, setImages] = useState(null)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null) // null | 'new' | <id>
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [imageBusy, setImageBusy] = useState(false)
  const [imageError, setImageError] = useState('')

  function load() {
    fetchGalleryImages()
      .then((res) => setImages(res.images))
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  function startNew() {
    setForm(emptyForm)
    setEditingId('new')
    setError('')
    setImageError('')
  }

  function startEdit(img) {
    setForm({ title: img.title || '', content: img.content || '', imageUrl: img.imageUrl })
    setEditingId(img.id)
    setError('')
    setImageError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setImageError('')
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImageError('')
    setImageBusy(true)
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      setForm((f) => ({ ...f, imageUrl: dataUrl }))
    } catch (err) {
      setImageError(err.message)
    } finally {
      setImageBusy(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    if (!form.imageUrl) {
      setError('사진을 선택해주세요')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        imageUrl: form.imageUrl,
      }
      if (editingId === 'new') {
        await createGalleryImage(payload, adminToken)
      } else {
        await updateGalleryImage(editingId, payload, adminToken)
      }
      cancelEdit()
      load()
      onChanged?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(img) {
    if (!window.confirm('이 사진을 삭제하시겠습니까?')) return
    setError('')
    try {
      await deleteGalleryImage(img.id, adminToken)
      if (editingId === img.id) cancelEdit()
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

        {error && <p className="form-hint error">{error}</p>}
        {!images && !error && <p className="modal-existing-empty">불러오는 중...</p>}
        {images && images.length === 0 && <p className="modal-existing-empty">등록된 사진이 없습니다</p>}

        {images && images.length > 0 && (
          <ul className="manage-list">
            {images.map((img) => (
              <li key={img.id} className={`manage-list-item ${editingId === img.id ? 'editing' : ''}`}>
                <img className="manage-list-thumb" src={img.imageUrl} alt="" />
                <div className="manage-list-main">
                  <p className="manage-list-title">{img.title || '(제목 없음)'}</p>
                  {img.content && <p className="manage-list-desc">{img.content}</p>}
                </div>
                <div className="manage-list-actions">
                  <button type="button" className="btn btn-outline-sm" onClick={() => startEdit(img)}>
                    수정
                  </button>
                  <button type="button" className="btn btn-outline-sm" onClick={() => handleDelete(img)}>
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {editingId !== null ? (
          <form className="modal-form" onSubmit={handleSave}>
            <p className="manage-form-title">{editingId === 'new' ? '사진 추가' : '사진 수정'}</p>
            <label>
              사진{editingId !== 'new' ? ' (다시 선택하면 교체됩니다)' : ''}
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={imageBusy} />
            </label>
            {imageBusy && <p className="form-hint">사진 처리 중...</p>}
            {imageError && <p className="form-hint error">{imageError}</p>}
            {form.imageUrl && !imageBusy && (
              <div className="manage-image-preview">
                <img src={form.imageUrl} alt="미리보기" />
              </div>
            )}
            <label>
              제목
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="예: 매장 전경 (선택)"
              />
            </label>
            <label>
              내용
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="사진 설명 (선택)"
              />
            </label>
            <div className="manage-form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving || imageBusy}>
                {saving ? '저장 중...' : '저장'}
              </button>
              <button type="button" className="btn btn-outline-sm" onClick={cancelEdit}>
                취소
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="btn btn-primary btn-full" onClick={startNew}>
            + 사진 추가
          </button>
        )}
      </div>
    </div>
  )
}
