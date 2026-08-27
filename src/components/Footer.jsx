import NaverMap from './NaverMap'
import './Footer.css'

const ADDRESS = '전북 전주시 덕진구 아중로 183'

export default function Footer() {
  return (
    <footer className="site-footer" id="location">
      <div className="footer-inner">
        <div className="footer-col">
          <h3>대아리 운암상회</h3>
          <p>{ADDRESS}</p>
          <p>대표 : 홍길동 | 사업자등록번호 123-45-67890</p>
          <p>전화 : 02-000-0000</p>
        </div>

        <div className="footer-col">
          <h3>상호안내</h3>
          <ul>
            <li>
              <a href="#about">매장 소개</a>
            </li>
            <li>
              <a href="#menu">메뉴 안내</a>
            </li>
            <li>
              <a href="#reservation">예약 안내</a>
            </li>
            <li>
              <a href="#location">오시는 길</a>
            </li>
          </ul>
        </div>

        <div className="footer-col map-col">
          <NaverMap address={ADDRESS} />
        </div>
      </div>

      <div className="footer-bottom">
        <ul className="footer-social">
          <li>
            <a href="#" aria-label="Facebook">
              F
            </a>
          </li>
          <li>
            <a href="#" aria-label="Instagram">
              I
            </a>
          </li>
          <li>
            <a href="#" aria-label="YouTube">
              Y
            </a>
          </li>
        </ul>
        <p>&copy; 2026 대아리 운암상회. All rights reserved.</p>
      </div>
    </footer>
  )
}
