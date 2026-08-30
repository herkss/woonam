// Cloudflare Workers 런타임의 Web Crypto API만 사용 (외부 라이브러리 불필요)

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return toHex(digest)
}

// OTP 코드, PIN 해시 (같은 서버 시크릿을 pepper로 사용)
export async function hashSecret(value, secret) {
  return sha256Hex(`${secret}:${value}`)
}

export async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return toHex(sig)
}

export function randomDigits(length) {
  const bytes = crypto.getRandomValues(new Uint32Array(length))
  return [...bytes].map((n) => n % 10).join('')
}

export function randomToken() {
  return toHex(crypto.getRandomValues(new Uint8Array(24)).buffer)
}
