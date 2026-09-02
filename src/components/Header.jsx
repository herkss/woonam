import { useState } from 'react'
import AdminAccessButton from './AdminAccessButton'
import brandLogo from '../assets/brand-logo.png'
import './Header.css'

const NAV_ITEMS = [
  { label: '소개', href: '#about' },
  { label: '메뉴', href: '#menu' },
  { label: '갤러리', href: '#gallery' },
  { label: '예약', href: '#reservation', active: true },
  { label: '오시는 길', href: '#location' },
]

function SocialIcons({ className = '' }) {
  return (
    <ul className={`social-icons ${className}`}>
      <li>
        <a href="#" aria-label="Facebook">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H16.7V3.7C16.4 3.66 15.4 3.57 14.24 3.57c-2.4 0-4.05 1.47-4.05 4.17V9.9H7.5V13h2.69v8h3.31z" />
          </svg>
        </a>
      </li>
      <li>
        <a href="#" aria-label="Instagram">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 3.2c2.67 0 3 .01 4.05.06 1.05.05 1.77.22 2.4.46.65.25 1.2.6 1.75 1.15.55.55.9 1.1 1.15 1.75.24.63.41 1.35.46 2.4.05 1.05.06 1.38.06 4.05s-.01 3-.06 4.05c-.05 1.05-.22 1.77-.46 2.4a4.7 4.7 0 0 1-1.15 1.75 4.7 4.7 0 0 1-1.75 1.15c-.63.24-1.35.41-2.4.46-1.05.05-1.38.06-4.05.06s-3-.01-4.05-.06c-1.05-.05-1.77-.22-2.4-.46a4.7 4.7 0 0 1-1.75-1.15 4.7 4.7 0 0 1-1.15-1.75c-.24-.63-.41-1.35-.46-2.4C3.21 15 3.2 14.67 3.2 12s.01-3 .06-4.05c.05-1.05.22-1.77.46-2.4.25-.65.6-1.2 1.15-1.75A4.7 4.7 0 0 1 6.62 2.65c.63-.24 1.35-.41 2.4-.46C9.97 2.14 10.3 2.13 12 2.13m0 1.8c-2.63 0-2.94.01-3.98.06-.9.04-1.39.19-1.71.31-.43.17-.74.37-1.06.7-.33.32-.53.63-.7 1.06-.12.32-.27.81-.31 1.71C4.2 9.06 4.19 9.37 4.19 12s.01 2.94.06 3.98c.04.9.19 1.39.31 1.71.17.43.37.74.7 1.06.32.33.63.53 1.06.7.32.12.81.27 1.71.31 1.04.05 1.35.06 3.98.06s2.94-.01 3.98-.06c.9-.04 1.39-.19 1.71-.31.43-.17.74-.37 1.06-.7.33-.32.53-.63.7-1.06.12-.32.27-.81.31-1.71.05-1.04.06-1.35.06-3.98s-.01-2.94-.06-3.98c-.04-.9-.19-1.39-.31-1.71a2.9 2.9 0 0 0-.7-1.06 2.9 2.9 0 0 0-1.06-.7c-.32-.12-.81-.27-1.71-.31-1.04-.05-1.35-.06-3.98-.06M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4m5.2-2a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3" />
          </svg>
        </a>
      </li>
      <li>
        <a href="#" aria-label="YouTube">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M21.6 7.2s-.2-1.5-.85-2.15c-.8-.85-1.7-.85-2.1-.9C15.9 4 12 4 12 4h0s-3.9 0-6.65.15c-.4.05-1.3.05-2.1.9C2.6 5.7 2.4 7.2 2.4 7.2S2.2 8.95 2.2 10.7v1.6c0 1.75.2 3.5.2 3.5s.2 1.5.85 2.15c.8.85 1.85.82 2.3.91C7.1 19 12 19 12 19s3.9 0 6.65-.15c.4-.05 1.3-.05 2.1-.9.65-.65.85-2.15.85-2.15s.2-1.75.2-3.5v-1.6c0-1.75-.2-3.5-.2-3.5M9.95 14.1V8.4l5.5 2.86-5.5 2.85z" />
          </svg>
        </a>
      </li>
    </ul>
  )
}

export default function Header({ onOpenManage, admin, onOpenMenuManage, onOpenNoticeManage, onOpenGalleryManage }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="topbar-inner">
          <a href="#waitlist" className="topbar-link">
            웨이팅걸기
          </a>
          <button type="button" className="topbar-link topbar-manage" onClick={onOpenManage}>
            예약 확인/변경
          </button>
          <SocialIcons />
          <AdminAccessButton
            admin={admin}
            onOpenMenuManage={onOpenMenuManage}
            onOpenNoticeManage={onOpenNoticeManage}
            onOpenGalleryManage={onOpenGalleryManage}
          />
        </div>
      </div>

      <div className="mainbar">
        <a href="#top" className="brand">
          <img src={brandLogo} alt="대아리 운암상회" className="brand-logo" />
        </a>

        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={item.active ? 'active' : ''}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-label="메뉴 열기"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}
