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
- 소개/메뉴/갤러리/오시는길 네비게이션은 전부 같은 페이지 내 앵커(`#about`, `#menu` 등)로만 연결됨 — 별도 페이지로 분리할지 결정 필요

### 4. 예약 시스템 (구현 완료, 배포 전 설정 필요)

달력 날짜 클릭 → 팝업(인원/시간/메뉴/이름/전화번호 입력 → 문자 인증 → 예약하기)까지 전체 흐름을 구현함.
헤더의 "예약 확인/변경"에서 비밀번호 또는 문자 인증으로 본인 확인 후 예약 수정/취소 가능.

- 프론트엔드: `src/components/ReservationModal.jsx`(신규 예약), `ReservationManage.jsx`(확인/변경), `src/lib/mask.js`(이름/전화번호 마스킹 — "김x자,010-2xx7-23x7,7명,5시" 형식), `src/lib/useOtp.js`, `src/lib/api.js`
- 백엔드: **Cloudflare Workers + Static Assets** (예전 Pages Functions 방식이 아님 — 아래 "배포 아키텍처 변경" 참고). API 로직 자체는 `functions/api/**`에 있고, `worker/index.js`가 진입점에서 `/api/*`만 라우팅해서 그 파일들의 핸들러를 그대로 호출함. 그 외 경로는 `env.ASSETS.fetch(request)`로 정적 파일(`dist`) 서빙.
- D1 데이터베이스: `migrations/0001_init.sql`
- 문자 발송: Solapi API 사용 (`functions/_shared/sms.js`). **API 키를 아직 등록 안 한 상태에서도 정상 동작** — 키가 없으면 실제 발송 대신 콘솔 로그로만 남기는 개발용 폴백이 들어있음
- 로컬 전체 테스트: `npm run worker:dev` (`npm run build && wrangler dev`) — 정적 페이지 + API + D1(로컬) + 실제 Solapi 발송까지 전부 포함해서 확인 가능. 최초 1회 `npm run d1:migrate:local`로 로컬 D1에 스키마 적용 필요.
- curl / 실제 문자 수신으로 OTP 요청·검증, 예약 생성/조회/수정/취소, 단일사용토큰, 마스킹목록, PIN조회 전 구간 테스트 완료 (2026-08-30, 로컬 wrangler dev + 실제 Solapi 발신 확인)

### 배포 아키텍처 변경 (2026-08-30)

처음엔 Cloudflare **Pages Functions**(`functions/` 폴더 자동 라우팅) 방식으로 만들었는데, Cloudflare 대시보드에서 새 프로젝트를 만드니 Pages가 아니라 **Workers(신규 통합 빌드, "Workers Builds")**로 생성되어 배포 명령이 `wrangler pages deploy`가 아니라 `wrangler deploy`로 실행됨. Workers는 `functions/` 자동 라우팅을 지원하지 않고, 대신 `wrangler.toml`의 `[assets]` 설정 + 진입점 Worker 스크립트(`worker/index.js`)가 라우팅을 직접 처리하는 구조라서 이에 맞게 변경함.
- `wrangler.toml`: `pages_build_output_dir` 대신 `main = "worker/index.js"` + `[assets] directory = "./dist" binding = "ASSETS" run_worker_first = ["/api/*"]`
- `functions/api/**`의 로직 파일들은 그대로 두고(수정 없음), `worker/index.js`가 얇은 라우터로서 그걸 호출함 — 나중에 실제 Pages 프로젝트로 옮기게 되면 `functions/`를 그대로 재사용 가능

**실제 배포 전 해야 할 일**:
1. ~~`npx wrangler d1 create woonam-reservations`~~ — 완료. `database_id`는 `wrangler.toml`에 이미 반영됨
2. ~~`npm run d1:migrate:remote`~~ — 완료. 운영 D1에 스키마 적용됨
3. Cloudflare 대시보드 → **Workers & Pages → woonam** → Settings → **Variables and Secrets**에 아래 값 등록 (`.dev.vars.example` 참고):
   - `SOLAPI_API_KEY`, `SOLAPI_API_SECRET` — Solapi 콘솔에서 발급. **API 키 생성 시 CIDR 대신 "모든 IP 허용" 선택** (Cloudflare Workers는 고정 발신 IP가 없어서 IP 제한이 안 맞음)
   - `SOLAPI_SENDER_NUMBER` — Solapi에 사전 등록된 발신번호
   - `OWNER_PHONE` — 점주가 예약 알림을 받을 번호
   - `TOKEN_SECRET` — 임의의 긴 랜덤 문자열 (OTP 해시/토큰 서명용, 로컬 `.dev.vars`에 쓴 값과 같게 맞추면 편함)
4. Settings → **Bindings**에서 D1 데이터베이스(`woonam-reservations`, 바인딩 이름 `DB`)가 연결돼 있는지 확인 (git 연동이면 `wrangler.toml`을 자동 인식하지만, 대시보드에서 이미 수동으로 한 번 추가한 이력이 있어서 중복/충돌 없는지 확인 필요)
5. 위 설정 후 git push하면 자동 재배포됨. 지금 당장은 대시보드에서 "Retry deployment"
6. (나중에) 카카오 알림톡: 비즈니스 채널 개설 + 템플릿 사전승인 완료되면 `functions/_shared/sms.js`에 알림톡 발송 분기 추가 예정

## 배포 방법 (재확인용)

```bash
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm install      # 최초 1회만 (의존성 변경 시에도)
npm run build    # 코드 수정할 때마다 실행 → dist/ 폴더 생성
```

**변경됨**: 이제 `dist` 폴더만 드래그 앤 드롭하는 방식은 안 됨 (API가 동작 안 함). GitHub(`herkss/woonam`) 연동 배포로 전환됨 — main 브랜치에 push하면 Cloudflare가 자동으로 `npm run build` 실행 후 `wrangler deploy`로 배포함. 빌드/배포 설정은 대시보드의 woonam 프로젝트 Settings에서 확인/수정.

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
