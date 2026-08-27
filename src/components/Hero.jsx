import { useState } from 'react'
import heroBanner from '../assets/hero-banner.png'
import './Hero.css'

const SLIDES = [0, 1, 2]

export default function Hero() {
  const [slide, setSlide] = useState(0)

  return (
    <section className="hero" id="top">
      <div className="hero-media">
        <img src={heroBanner} alt="대아리 운암상회" className="hero-img" />
        <div className="hero-overlay" />
      </div>

      <div className="hero-dots">
        {SLIDES.map((i) => (
          <button
            key={i}
            className={i === slide ? 'active' : ''}
            aria-label={`슬라이드 ${i + 1}`}
            onClick={() => setSlide(i)}
          />
        ))}
      </div>

      <div className="reservation-card">
        <div className="reservation-date">
          <span className="rd-label">예약 날짜</span>
          <span className="rd-day">9</span>
          <span className="rd-day">9</span>
        </div>
        <div className="reservation-info">
          <p className="ri-title">온라인예약</p>
          <p className="ri-sub">20석 예약가능</p>
        </div>
        <a href="#reservation" className="btn btn-outline-sm">
          확인하기
        </a>
      </div>
    </section>
  )
}
