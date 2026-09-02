import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import TodayPick from './components/TodayPick'
import Gallery from './components/Gallery'
import Notices from './components/Notices'
import Footer from './components/Footer'
import ReservationModal from './components/ReservationModal'
import ReservationManage from './components/ReservationManage'
import AdminDayModal from './components/AdminDayModal'
import MenuManageModal from './components/MenuManageModal'
import NoticeManageModal from './components/NoticeManageModal'
import GalleryManageModal from './components/GalleryManageModal'
import { useAdminSession } from './lib/useAdminSession'

function App() {
  const [bookingDate, setBookingDate] = useState(null)
  const [manageOpen, setManageOpen] = useState(false)
  const [adminDate, setAdminDate] = useState(null)
  const [menuManageOpen, setMenuManageOpen] = useState(false)
  const [noticeManageOpen, setNoticeManageOpen] = useState(false)
  const [galleryManageOpen, setGalleryManageOpen] = useState(false)
  const [menuVersion, setMenuVersion] = useState(0)
  const [noticeVersion, setNoticeVersion] = useState(0)
  const [galleryVersion, setGalleryVersion] = useState(0)
  const admin = useAdminSession()

  return (
    <>
      <Header
        onOpenManage={() => setManageOpen(true)}
        admin={admin}
        onOpenMenuManage={() => setMenuManageOpen(true)}
        onOpenNoticeManage={() => setNoticeManageOpen(true)}
        onOpenGalleryManage={() => setGalleryManageOpen(true)}
      />
      <main>
        <Hero />
        <TodayPick
          onSelectDate={setBookingDate}
          onAdminSelectDate={setAdminDate}
          admin={admin}
          onOpenMenuManage={() => setMenuManageOpen(true)}
          menuVersion={menuVersion}
        />
        <Gallery
          admin={admin}
          onOpenGalleryManage={() => setGalleryManageOpen(true)}
          galleryVersion={galleryVersion}
        />
        <Notices admin={admin} onOpenNoticeManage={() => setNoticeManageOpen(true)} noticeVersion={noticeVersion} />
      </main>
      <Footer />

      {bookingDate && (
        <ReservationModal
          date={bookingDate}
          onClose={() => setBookingDate(null)}
          onOpenManage={() => {
            setBookingDate(null)
            setManageOpen(true)
          }}
        />
      )}
      {manageOpen && <ReservationManage onClose={() => setManageOpen(false)} />}
      {adminDate && (
        <AdminDayModal date={adminDate} adminToken={admin.token} onClose={() => setAdminDate(null)} />
      )}
      {menuManageOpen && (
        <MenuManageModal
          adminToken={admin.token}
          onClose={() => setMenuManageOpen(false)}
          onChanged={() => setMenuVersion((v) => v + 1)}
        />
      )}
      {noticeManageOpen && (
        <NoticeManageModal
          adminToken={admin.token}
          onClose={() => setNoticeManageOpen(false)}
          onChanged={() => setNoticeVersion((v) => v + 1)}
        />
      )}
      {galleryManageOpen && (
        <GalleryManageModal
          adminToken={admin.token}
          onClose={() => setGalleryManageOpen(false)}
          onChanged={() => setGalleryVersion((v) => v + 1)}
        />
      )}
    </>
  )
}

export default App
