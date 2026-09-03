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
    </section>
  )
}
