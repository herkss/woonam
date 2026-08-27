import { useEffect, useRef, useState } from 'react'

// 네이버 클라우드 플랫폼(console.ncloud.com) > AI·NAVER API > Maps 에서
// Application을 등록하고 발급받은 Client ID로 교체하세요.
// 등록 시 "Web 서비스 URL"에 배포된 Cloudflare Pages 도메인을 반드시 추가해야 합니다.
const NAVER_MAP_CLIENT_ID = 'qy3z93rswz'

const JEONJU_FALLBACK_CENTER = { lat: 35.8242, lng: 127.148 }

function loadNaverMapsScript(clientId) {
  return new Promise((resolve, reject) => {
    if (window.naver && window.naver.maps) {
      resolve(window.naver)
      return
    }
    const existing = document.getElementById('naver-map-sdk')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.naver))
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.id = 'naver-map-sdk'
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`
    script.async = true
    script.onload = () => resolve(window.naver)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function NaverMap({ address }) {
  const mapRef = useRef(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (NAVER_MAP_CLIENT_ID === 'YOUR_NCP_CLIENT_ID') {
      setStatus('missing-key')
      return
    }

    let cancelled = false

    loadNaverMapsScript(NAVER_MAP_CLIENT_ID)
      .then((naver) => {
        if (cancelled || !mapRef.current) return

        const map = new naver.maps.Map(mapRef.current, {
          center: new naver.maps.LatLng(
            JEONJU_FALLBACK_CENTER.lat,
            JEONJU_FALLBACK_CENTER.lng,
          ),
          zoom: 16,
        })

        naver.maps.Service.geocode({ query: address }, (geoStatus, response) => {
          if (geoStatus !== naver.maps.Service.Status.OK) return
          const result = response.v2.addresses[0]
          if (!result) return
          const point = new naver.maps.LatLng(result.y, result.x)
          map.setCenter(point)
          new naver.maps.Marker({ position: point, map })
        })

        setStatus('ready')
      })
      .catch(() => setStatus('error'))

    return () => {
      cancelled = true
    }
  }, [address])

  if (status !== 'ready') {
    return (
      <div className="map-frame map-fallback">
        <svg viewBox="0 0 100 100" width="28" height="28">
          <path
            d="M50 8c-16 0-29 13-29 29 0 21 29 55 29 55s29-34 29-55c0-16-13-29-29-29z"
            fill="#c69a5e"
          />
          <circle cx="50" cy="37" r="11" fill="#172a3f" />
        </svg>
        <span>{address}</span>
        {status === 'missing-key' && (
          <span className="map-hint">네이버 지도 Client ID 등록 후 실제 지도가 표시됩니다</span>
        )}
      </div>
    )
  }

  return <div ref={mapRef} className="map-frame" />
}
