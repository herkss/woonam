import { useEffect, useRef, useState } from 'react'
import { requestOtp, verifyOtp } from './api'

const COOLDOWN_SEC = 60

export function useOtp(purpose) {
  const [sent, setSent] = useState(false)
  const [verifyToken, setVerifyToken] = useState(null)
  const [cooldown, setCooldown] = useState(0)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const timerRef = useRef(null)

  useEffect(() => () => clearInterval(timerRef.current), [])

  function startCooldown() {
    setCooldown(COOLDOWN_SEC)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  async function send(phone) {
    setError('')
    setSending(true)
    try {
      await requestOtp(phone, purpose)
      setSent(true)
      startCooldown()
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  async function confirm(phone, code) {
    setError('')
    setVerifying(true)
    try {
      const res = await verifyOtp(phone, purpose, code)
      setVerifyToken(res.verifyToken)
      return res.verifyToken
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setVerifying(false)
    }
  }

  function reset() {
    setSent(false)
    setVerifyToken(null)
    setCooldown(0)
    setError('')
    clearInterval(timerRef.current)
  }

  return { sent, verifyToken, cooldown, sending, verifying, error, send, confirm, reset }
}
