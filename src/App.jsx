import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import TodayPick from './components/TodayPick'
import Notices from './components/Notices'
import Footer from './components/Footer'
import ReservationModal from './components/ReservationModal'
import ReservationManage from './components/ReservationManage'

function App() {
  const [bookingDate, setBookingDate] = useState(null)
  const [manageOpen, setManageOpen] = useState(false)

  return (
    <>
      <Header onOpenManage={() => setManageOpen(true)} />
      <main>
        <Hero />
        <TodayPick onSelectDate={setBookingDate} />
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
    </>
  )
}

export default App
