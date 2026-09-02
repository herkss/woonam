import { useEffect, useState } from 'react'
import { fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../lib/api'
import './ReservationModal.css'
import './ManageModal.css'

const emptyForm = { name: '', price: '', description: '', imageUrl: '' }

export default function MenuManageModal({ adminToken, onClose, onChanged }) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null) // null | 'new' | <id>
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

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
  }

  function startEdit(item) {
    setForm({
      name: item.name,
      price: String(item.price),
      description: item.description || '',
      imageUrl: item.imageUrl || '',
    })
    setEditingId(item.id)
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
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

        {items && items.length > 0 && (
          <ul className="manage-list">
            {items.map((item) => (
              <li key={item.id} className={`manage-list-item ${editingId === item.id ? 'editing' : ''}`}>
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
        )}

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
              이미지 URL
              <input
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://... (선택, 비워두면 기본 그림 표시)"
              />
            </label>
            <div className="manage-form-actions">
              <button type="submit" className="btn btn-primary" disabled={!form.name.trim() || saving}>
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
