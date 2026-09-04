import { useEffect, useState } from 'react'
import { fetchVisitorCount, incrementVisitorCount } from '../lib/api'
import './VisitorCounter.css'

const SESSION_KEY = 'woonam_visitor_counted'

export default function VisitorCounter() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    let cancelled = false
    const alreadyCounted = sessionStorage.getItem(SESSION_KEY)
    const request = alreadyCounted ? fetchVisitorCount() : incrementVisitorCount()

    request
      .then((res) => {
        if (cancelled) return
        setCount(res.count)
        sessionStorage.setItem(SESSION_KEY, '1')
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  if (count === null) return null

  return (
    <span className="visitor-counter" title="누적 방문자수">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2.7" />
      </svg>
      방문자 <strong>{count.toLocaleString()}</strong>
    </span>
  )
}
