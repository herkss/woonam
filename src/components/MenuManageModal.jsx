import { useEffect, useState } from 'react'
import { fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../lib/api'
import { fileToResizedDataUrl } from '../lib/image'
import { MENU_CATEGORIES } from '../lib/menuCategories'
import './ReservationModal.css'
import './ManageModal.css'

const emptyForm = { name: '', price: '', description: '', imageUrl: '', category: MENU_CATEGORIES[0] }

export default function MenuManageModal({ adminToken, onClose, onChanged }) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null) // null | 'new' | <id>
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [imageBusy, setImageBusy] = useState(false)
  const [imageError, setImageError] = useState('')

  function load() {
    fetchMenuItems()
      .then((res) => setItems(res.items))
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  function startNew() {
    setForm(emptyForm)
    setEditingId('new')
    setError('')
    setImageError('')
  }

  function startEdit(item) {
    setForm({
      name: item.name,
      price: String(item.price),
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      category: MENU_CATEGORIES.includes(item.category) ? item.category : MENU_CATEGORIES[0],
    })
    setEditingId(item.id)
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

  function clearImage() {
    setForm((f) => ({ ...f, imageUrl: '' }))
    setImageError('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price) || 0,
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        category: form.category,
      }
      if (editingId === 'new') {
        await createMenuItem(payload, adminToken)
      } else {
        await updateMenuItem(editingId, payload, adminToken)
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

  async function handleDelete(item) {
    if (!window.confirm(`'${item.name}' 메뉴를 삭제하시겠습니까?`)) return
    setError('')
    try {
      await deleteMenuItem(item.id, adminToken)
      if (editingId === item.id) cancelEdit()
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

        <h3 className="modal-title">메뉴 관리</h3>

        {error && <p className="form-hint error">{error}</p>}
        {!items && !error && <p className="modal-existing-empty">불러오는 중...</p>}

        {items && items.length === 0 && <p className="modal-existing-empty">등록된 메뉴가 없습니다</p>}

        {items &&
          items.length > 0 &&
          MENU_CATEGORIES.map((category) => {
            const categoryItems = items.filter((item) => item.category === category)
            if (categoryItems.length === 0) return null
            return (
              <div key={category} className="manage-category">
                <p className="manage-category-title">{category}</p>
                <ul className="manage-list">
                  {categoryItems.map((item) => (
                    <li
                      key={item.id}
                      className={`manage-list-item ${editingId === item.id ? 'editing' : ''}`}
                    >
                      <div className="manage-list-main">
                        <p className="manage-list-title">
                          {item.name} · {item.priceLabel}
                        </p>
                        {item.description && <p className="manage-list-desc">{item.description}</p>}
                      </div>
                      <div className="manage-list-actions">
                        <button type="button" className="btn btn-outline-sm" onClick={() => startEdit(item)}>
                          수정
                        </button>
                        <button type="button" className="btn btn-outline-sm" onClick={() => handleDelete(item)}>
                          삭제
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

        {editingId !== null ? (
          <form className="modal-form" onSubmit={handleSave}>
            <p className="manage-form-title">{editingId === 'new' ? '메뉴 추가' : '메뉴 수정'}</p>
            <label>
              메뉴명
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="예: 향어회"
                autoFocus
              />
            </label>
            <label>
              분류
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {MENU_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              가격 (원)
              <input
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/\D/g, '') }))}
                placeholder="35000"
                inputMode="numeric"
              />
            </label>
            <label>
              설명
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="메뉴 소개 (선택)"
              />
            </label>
            <label>
              사진 (선택)
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={imageBusy} />
            </label>
            {imageBusy && <p className="form-hint">사진 처리 중...</p>}
            {imageError && <p className="form-hint error">{imageError}</p>}
            {form.imageUrl && !imageBusy && (
              <div className="manage-image-preview">
                <img src={form.imageUrl} alt="미리보기" />
                <button type="button" className="btn btn-outline-sm" onClick={clearImage}>
                  사진 제거
                </button>
              </div>
            )}
            {!form.imageUrl && !imageBusy && (
              <p className="manage-hint">사진을 첨부하지 않으면 기본 그림이 표시됩니다.</p>
            )}
            <div className="manage-form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!form.name.trim() || saving || imageBusy}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              <button type="button" className="btn btn-outline-sm" onClick={cancelEdit}>
                취소
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="btn btn-primary btn-full" onClick={startNew}>
            + 메뉴 추가
          </button>
        )}
      </div>
    </div>
  )
}
