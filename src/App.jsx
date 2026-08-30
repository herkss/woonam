import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import TodayPick from './components/TodayPick'
import Notices from './components/Notices'
import Footer from './components/Footer'
import ReservationModal from './components/ReservationModal'
import ReservationManage from './components/ReservationManage'
import AdminDayModal from './components/AdminDayModal'
import { useAdminSession } from './lib/useAdminSession'

function App() {
  const [bookingDate, setBookingDate] = useState(null)
  const [manageOpen, setManageOpen] = useState(false)
  const [adminDate, setAdminDate] = useState(null)
  const admin = useAdminSession()

  return (
    <>
      <Header onOpenManage={() => setManageOpen(true)} />
      <main>
        <Hero />
        <TodayPick onSelectDate={setBookingDate} onAdminSelectDate={setAdminDate} admin={admin} />
        <Notices />
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
    </>
  )
}

export default App
