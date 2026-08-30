import { useCallback, useState } from 'react'
import { adminChangePassword, adminLogin } from './api'

const STORAGE_KEY = 'woonam_admin_token'

function readStoredToken() {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredToken(token) {
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // sessionStorage 접근 불가 시(사파리 프라이빗 모드 등) 세션 유지만 포기하고 계속 진행
  }
}

export function useAdminSession() {
  const [token, setToken] = useState(() => readStoredToken())

  const login = useCallback(async (password) => {
    const res = await adminLogin(password)
    setToken(res.adminToken)
    writeStoredToken(res.adminToken)
    return res.adminToken
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    writeStoredToken(null)
  }, [])

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      await adminChangePassword({ adminToken: token, currentPassword, newPassword })
    },
    [token],
  )

  return { token, isAdmin: Boolean(token), login, logout, changePassword }
}
