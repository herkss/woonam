# 운암상회 홈페이지 — 진행 상황

React(Vite)로 만든 식당 홈페이지. 참고 디자인은 사용자가 제공한 목업 이미지(한담 민물고기 스타일 UI)를 기반으로 제작. Cloudflare Pages에 **Direct Upload(dist 폴더 업로드) 방식**으로 배포 중.

## 현재 상태 (완료)

- Vite + React 19 프로젝트 셋업 (`npm create vite -- --template react`)
- Node.js는 nvm으로 설치됨 (`~/.nvm`, LTS 버전). 새 셸에서는 아래처럼 로드 필요:
  ```bash
  export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  ```
- 페이지 구성 (전부 한 페이지 내 섹션/앵커 링크, 별도 라우팅 없음):
  - `Header` — 상단 바(웨이팅걸기, SNS 아이콘) + 로고 "대아리 운암상회" + 네비게이션(소개/메뉴/갤러리/예약/오시는길), 모바일 햄버거 메뉴
  - `Hero` — 배경 일러스트 + 카피 문구 + "온라인 예약하기" 버튼 + 캐러셀 점 + 우하단 겹침 예약 카드(날짜/좌석/확인하기)
  - `TodayPick` — "오늘의 추천" 메뉴 카드 2개 + "예약 현황" 달력(오늘 날짜 자동 하이라이트, 월 이동 가능)
  - `Notices` — "공지사항 및 이벤트" 카드 리스트 + "예약" 알림 리스트
  - `Footer` — 매장 정보(주소/대표/사업자번호/전화) + 상호안내 링크 + 지도 + SNS + 저작권
  - `Calendar` — 재사용 가능한 달력 컴포넌트 (`src/components/Calendar.jsx`)
  - `FoodArt` — 실제 사진 대신 임시로 넣은 SVG 일러스트 (자연산회/매운탕/공지 썸네일 등)
- 반응형 대응 완료 (데스크톱/태블릿/모바일 3단계 breakpoint), headless Chrome 스크린샷으로 직접 검증함
- 상호명 변경: "한담 민물고기" → **"대아리 운암상회"** (전체 소스에서 교체 완료)
- 주소 반영: **전북 전주시 덕진구 아중로 183** (Footer에 표시)
- 지도: 처음엔 Google Maps(API 키 불필요, `output=embed` 방식)로 구현했다가, 사용자 요청으로 **네이버 지도**로 교체함

## 미완료 / 다음에 이어서 할 일

### 1. 네이버 지도 Client ID 발급 필요 (최우선)
- 파일: `src/components/NaverMap.jsx`
- 4번째 줄 `NAVER_MAP_CLIENT_ID = 'YOUR_NCP_CLIENT_ID'` 를 실제 발급받은 키로 교체해야 함
- 발급 방법:
  1. [console.ncloud.com](https://console.ncloud.com) 가입/로그인
  2. AI·NAVER API → Maps → Application 등록
  3. "Web 서비스 URL"에 배포된 Cloudflare Pages 도메인 등록 (예: `https://프로젝트명.pages.dev`)
  4. 발급된 Client ID를 코드에 붙여넣기
- 키가 없는 동안은 지도 자리에 주소 텍스트 + 안내 문구만 표시되도록 fallback 처리되어 있음 (에러 없이 정상 동작)

### 2. 실제 콘텐츠로 교체 필요 (현재 전부 placeholder)
- **음식 사진**: `src/components/FoodArt.jsx`의 SVG 일러스트 → 실제 사진으로. `public/images/` 폴더에 넣고 `<img src="/images/파일명.jpg" />`로 교체
- **매장 정보** (`src/components/Footer.jsx`): 대표명 "홍길동", 사업자등록번호 "123-45-67890", 전화번호 "02-000-0000" → 실제 정보로 교체 필요
- **SNS 링크**: Header/Footer의 Facebook/Instagram/YouTube 아이콘이 전부 `href="#"` placeholder — 실제 계정 URL 필요
- **메뉴명/가격**: TodayPick의 "자연산회 우럭 35,000원", "매콤한 매운탕 29,000원" — 확인 필요 (이미지 원본 텍스트가 흐릿해서 추정 작성함)
- **공지사항 내용**: Notices 섹션 텍스트도 예시로 작성된 상태

### 3. 기능적으로 비어있는 부분
- 예약 시스템: 달력과 "온라인 예약하기" 버튼은 UI만 존재, 실제 예약 처리 로직/백엔드 없음
- 소개/메뉴/갤러리/오시는길 네비게이션은 전부 같은 페이지 내 앵커(`#about`, `#menu` 등)로만 연결됨 — 별도 페이지로 분리할지 결정 필요

## 배포 방법 (재확인용)

```bash
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm install      # 최초 1회만 (의존성 변경 시에도)
npm run build    # 코드 수정할 때마다 실행 → dist/ 폴더 생성
```

`dist` 폴더를 Cloudflare Pages 대시보드 → **Upload assets**에 그대로(폴더째) 드래그 앤 드롭.

## 파일 구조

```
src/
  App.jsx                 # 전체 페이지 조합
  components/
    Header.jsx / .css
    Hero.jsx / .css
    TodayPick.jsx / .css
    Notices.jsx / .css
    Footer.jsx / .css
    Calendar.jsx / .css
    NaverMap.jsx           # 네이버 지도 (Client ID 필요)
    FoodArt.jsx             # 임시 SVG 일러스트 (실사진 교체 대상)
  index.css                 # 전역 스타일/색상 변수
```
