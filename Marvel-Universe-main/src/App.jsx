import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Navbar from './components/Navbar.jsx'
import Features from './components/Features.jsx'
import Story from './components/Story.jsx'
import UpcomingFilms from './components/UpcomingFilms.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'

const App = () => {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <main className='relative min-h-screen w-screen
         overflow-x-hidden'>
         <Navbar/>
          <Hero/>
          <About/>
          <Features/>
          <Story/>
          <UpcomingFilms/>
          <Contact/>
          <Footer/>
        </main>
      </FavoritesProvider>
    </AuthProvider>
  )
}

export default App