import { useEffect, useState } from 'react'
import { fetchNotices, createNotice, updateNotice, deleteNotice } from '../lib/api'
import './ReservationModal.css'
import './ManageModal.css'

const emptyForm = { title: '', content: '' }

export default function NoticeManageModal({ adminToken, onClose, onChanged }) {
  const [notices, setNotices] = useState(null)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null) // null | 'new' | <id>
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  function load() {
    fetchNotices()
      .then((res) => setNotices(res.notices))
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  function startNew() {
    setForm(emptyForm)
    setEditingId('new')
    setError('')
  }

  function startEdit(notice) {
    setForm({ title: notice.title, content: notice.content || '' })
    setEditingId(notice.id)
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
      const payload = { title: form.title.trim(), content: form.content.trim() }
      if (editingId === 'new') {
        await createNotice(payload, adminToken)
      } else {
        await updateNotice(editingId, payload, adminToken)
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

  async function handleDelete(notice) {
    if (!window.confirm(`'${notice.title}' 공지사항을 삭제하시겠습니까?`)) return
    setError('')
    try {
      await deleteNotice(notice.id, adminToken)
      if (editingId === notice.id) cancelEdit()
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

        <h3 className="modal-title">공지사항 관리</h3>

        {error && <p className="form-hint error">{error}</p>}
        {!notices && !error && <p className="modal-existing-empty">불러오는 중...</p>}

        {notices && notices.length === 0 && <p className="modal-existing-empty">등록된 공지사항이 없습니다</p>}

        {notices && notices.length > 0 && (
          <ul className="manage-list">
            {notices.map((notice) => (
              <li key={notice.id} className={`manage-list-item ${editingId === notice.id ? 'editing' : ''}`}>
                <div className="manage-list-main">
                  <p className="manage-list-title">{notice.title}</p>
                  {notice.content && <p className="manage-list-desc">{notice.content}</p>}
                </div>
                <div className="manage-list-actions">
                  <button type="button" className="btn btn-outline-sm" onClick={() => startEdit(notice)}>
                    수정
                  </button>
                  <button type="button" className="btn btn-outline-sm" onClick={() => handleDelete(notice)}>
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {editingId !== null ? (
          <form className="modal-form" onSubmit={handleSave}>
            <p className="manage-form-title">{editingId === 'new' ? '공지사항 작성' : '공지사항 수정'}</p>
            <label>
              제목
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="예: 일요일 정기 휴무 안내"
                autoFocus
              />
            </label>
            <label>
              내용
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="공지 내용을 입력해주세요"
              />
            </label>
            <div className="manage-form-actions">
              <button type="submit" className="btn btn-primary" disabled={!form.title.trim() || saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
              <button type="button" className="btn btn-outline-sm" onClick={cancelEdit}>
                취소
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="btn btn-primary btn-full" onClick={startNew}>
            + 공지사항 작성
          </button>
        )}
      </div>
    </div>
  )
}
