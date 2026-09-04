import { useEffect, useState } from 'react'
import heroBanner from '../assets/hero-banner.png'
import { fetchMenuItems } from '../lib/api'
import './Hero.css'

export default function Hero() {
  const [slide, setSlide] = useState(0)
  const [menuSlides, setMenuSlides] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchMenuItems()
      .then((res) => {
        if (cancelled) return
        const withPhotos = res.items
          .filter((item) => item.imageUrl)
          .map((item) => ({ src: item.imageUrl, alt: item.name }))
        setMenuSlides(withPhotos)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const slides = [{ src: heroBanner, alt: '대아리 운암상회' }, ...menuSlides]

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % slides.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section className="hero" id="top">
      <div className="hero-media">
        {slides.map((s, i) => (
          <img
            key={s.src}
            src={s.src}
            alt={s.alt}
            className={`hero-img ${i === slide ? 'active' : ''}`}
          />
        ))}
        <div className="hero-overlay" />
      </div>

      {slides.length > 1 && (
        <div className="hero-dots">
          {slides.map((s, i) => (
            <button
              key={s.src}
              className={i === slide ? 'active' : ''}
              aria-label={`슬라이드 ${i + 1}`}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
