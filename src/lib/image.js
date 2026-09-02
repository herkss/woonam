// 로컬/모바일에서 첨부한 메뉴 사진을 DB에 저장 가능한 크기로 줄여 data URL로 변환.
// 별도 파일 스토리지(R2 등) 없이 D1 텍스트 컬럼에 바로 저장하기 위한 용도.

const MAX_DIMENSION = 900
const MAX_DATA_URL_LENGTH = 700_000 // 대략 원본 500KB 내외

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다'))
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = () => reject(new Error('이미지를 불러올 수 없습니다'))
    img.onload = () => resolve(img)
    img.src = src
  })
}

function drawToDataUrl(img, maxDimension, quality) {
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}

// 이미지 파일을 받아 리사이즈/압축한 JPEG data URL을 반환. 용량이 너무 크면 품질을 낮춰 재시도.
export async function fileToResizedDataUrl(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 첨부할 수 있습니다')
  }

  const src = await readFileAsDataUrl(file)
  const img = await loadImage(src)

  for (const [dimension, quality] of [
    [MAX_DIMENSION, 0.72],
    [700, 0.55],
    [500, 0.5],
  ]) {
    const dataUrl = drawToDataUrl(img, dimension, quality)
    if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl
  }

  throw new Error('이미지 용량이 너무 큽니다. 더 작은 사진을 사용해주세요')
}
