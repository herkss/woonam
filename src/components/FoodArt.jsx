// Decorative illustrations standing in for real food photography.
// Replace any of these usages with <img src="/images/..."> once real photos are ready.

export function HeroArt() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="art-svg">
      <defs>
        <radialGradient id="heroBg" cx="30%" cy="35%" r="80%">
          <stop offset="0%" stopColor="#3a2e2a" />
          <stop offset="100%" stopColor="#100c0a" />
        </radialGradient>
        <linearGradient id="bowlGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c0442c" />
          <stop offset="100%" stopColor="#7a2418" />
        </linearGradient>
        <linearGradient id="plateGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3ece0" />
          <stop offset="100%" stopColor="#d8cdb8" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#heroBg)" />
      <ellipse cx="230" cy="300" rx="230" ry="90" fill="url(#plateGrad)" opacity="0.95" />
      <ellipse cx="230" cy="292" rx="190" ry="66" fill="#fbf7ee" opacity="0.9" />
      <path d="M110 280 Q170 250 240 275 Q300 250 350 285 Q290 305 240 300 Q170 315 110 280Z" fill="#e8956f" />
      <path d="M140 270 Q200 245 250 265" stroke="#c8724b" strokeWidth="4" fill="none" opacity="0.6" />
      <circle cx="330" cy="270" r="6" fill="#3f7d3a" />
      <circle cx="345" cy="285" r="5" fill="#3f7d3a" />
      <circle cx="200" cy="255" r="5" fill="#b5432a" />
      <ellipse cx="580" cy="330" rx="200" ry="80" fill="url(#bowlGrad)" />
      <ellipse cx="580" cy="315" rx="175" ry="58" fill="#a8371f" />
      <path d="M470 300 Q520 280 570 305 Q620 275 690 300 Q630 330 570 320 Q510 335 470 300Z" fill="#d1663c" />
      <circle cx="500" cy="305" r="7" fill="#4a8b3f" />
      <circle cx="650" cy="295" r="6" fill="#c73b2a" />
      <circle cx="620" cy="320" r="5" fill="#4a8b3f" />
    </svg>
  )
}

export function SashimiArt() {
  return (
    <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" className="art-svg">
      <defs>
        <linearGradient id="sashimiPlate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4efe4" />
          <stop offset="100%" stopColor="#ded2b8" />
        </linearGradient>
      </defs>
      <rect width="300" height="220" fill="#e9e2d2" />
      <ellipse cx="150" cy="120" rx="130" ry="72" fill="url(#sashimiPlate)" />
      <ellipse cx="150" cy="112" rx="105" ry="52" fill="#faf6ec" />
      <g>
        <path d="M70 110 q30 -22 60 -6 q30 -18 60 0 q28 -14 55 4" stroke="none" fill="#e7a98f" />
        <ellipse cx="95" cy="108" rx="26" ry="12" fill="#f0b79b" />
        <ellipse cx="140" cy="118" rx="26" ry="12" fill="#eb9f80" />
        <ellipse cx="185" cy="104" rx="26" ry="12" fill="#f0b79b" />
        <ellipse cx="215" cy="122" rx="20" ry="10" fill="#eb9f80" />
      </g>
      <circle cx="95" cy="90" r="6" fill="#3f7d3a" />
      <circle cx="180" cy="86" r="5" fill="#3f7d3a" />
      <circle cx="150" cy="140" r="5" fill="#b5432a" />
    </svg>
  )
}

export function StewArt() {
  return (
    <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" className="art-svg">
      <defs>
        <radialGradient id="stewBroth" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#d1522f" />
          <stop offset="100%" stopColor="#8f2c17" />
        </radialGradient>
      </defs>
      <rect width="300" height="220" fill="#3a2c22" />
      <ellipse cx="150" cy="130" rx="125" ry="66" fill="url(#stewBroth)" />
      <ellipse cx="150" cy="118" rx="102" ry="46" fill="#c3431f" />
      <path d="M70 118 q40 -24 80 -4 q35 -18 78 4 q-40 26 -78 18 q-42 12 -80 -18Z" fill="#e07a48" />
      <circle cx="110" cy="112" r="7" fill="#4a8b3f" />
      <circle cx="200" cy="106" r="6" fill="#c73b2a" />
      <circle cx="170" cy="132" r="5" fill="#4a8b3f" />
      <circle cx="130" cy="140" r="5" fill="#eecf7d" />
    </svg>
  )
}

export function NoticeArt({ tone = 'a' }) {
  const colors =
    tone === 'a'
      ? ['#3a5a78', '#1c3350']
      : ['#c69a5e', '#8f6a37']
  return (
    <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice" className="art-svg">
      <defs>
        <linearGradient id={`notice-${tone}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <rect width="200" height="140" fill={`url(#notice-${tone})`} />
      <circle cx="150" cy="30" r="40" fill="rgba(255,255,255,0.08)" />
      <circle cx="30" cy="120" r="55" fill="rgba(0,0,0,0.12)" />
    </svg>
  )
}
