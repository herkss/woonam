import Header from './components/Header'
import Hero from './components/Hero'
import TodayPick from './components/TodayPick'
import Notices from './components/Notices'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TodayPick />
        <Notices />
      </main>
      <Footer />
    </>
  )
}

export default App
