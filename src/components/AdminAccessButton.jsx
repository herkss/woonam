import { useState } from 'react'
import './AdminAccessButton.css'

export default function AdminAccessButton({ admin }) {
  const [open, setOpen] = useState(false) // 로그인 전: 비밀번호 입력 박스 / 로그인 후: 메뉴
  const [mode, setMode] = useState('login') // 'login' | 'menu' | 'change'

  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)

  function toggle() {
    setOpen((v) => !v)
    setMode(admin.isAdmin ? 'menu' : 'login')
    setLoginError('')
    setPwError('')
    setPwSuccess(false)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError('')
    try {
      await admin.login(password)
      setPassword('')
      setOpen(false)
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setLoggingIn(false)
    }
  }

  function handleLogout() {
    admin.logout()
    setOpen(false)
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwError('')
    if (newPw.length < 4) return setPwError('새 비밀번호는 4자 이상으로 입력해주세요')
    if (newPw !== newPw2) return setPwError('새 비밀번호가 서로 일치하지 않습니다')
    setPwSaving(true)
    try {
      await admin.changePassword(curPw, newPw)
      setPwSuccess(true)
      setCurPw('')
      setNewPw('')
      setNewPw2('')
    } catch (err) {
      setPwError(err.message)
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="admin-access">
      <button type="button" className="admin-access-btn" onClick={toggle}>
        {admin.isAdmin ? '점주모드' : '점주확인'}
      </button>

      {open && (
        <div className="admin-access-popover">
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <p className="admin-access-title">점주 확인</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                autoFocus
              />
              {loginError && <p className="admin-access-error">{loginError}</p>}
              <button type="submit" className="btn btn-primary" disabled={!password || loggingIn}>
                {loggingIn ? '확인 중...' : '확인'}
              </button>
            </form>
          )}

          {mode === 'menu' && (
            <div>
              <p className="admin-access-title">점주모드 사용 중</p>
              <p className="admin-access-hint">날짜를 클릭하면 전체 예약 내역을 볼 수 있습니다.</p>
              <button type="button" className="btn btn-outline-sm" onClick={() => setMode('change')}>
                비밀번호 변경
              </button>
              <button type="button" className="btn btn-outline-sm" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          )}

          {mode === 'change' && (
            <form onSubmit={handleChangePassword}>
              <p className="admin-access-title">비밀번호 변경</p>
              <input
                type="password"
                value={curPw}
                onChange={(e) => setCurPw(e.target.value)}
                placeholder="현재 비밀번호"
              />
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="새 비밀번호"
              />
              <input
                type="password"
                value={newPw2}
                onChange={(e) => setNewPw2(e.target.value)}
                placeholder="새 비밀번호 확인"
              />
              {pwError && <p className="admin-access-error">{pwError}</p>}
              {pwSuccess && <p className="admin-access-success">변경되었습니다</p>}
              <button type="submit" className="btn btn-primary" disabled={!curPw || pwSaving}>
                {pwSaving ? '저장 중...' : '저장'}
              </button>
              <button type="button" className="btn btn-outline-sm" onClick={() => setMode('menu')}>
                뒤로
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
