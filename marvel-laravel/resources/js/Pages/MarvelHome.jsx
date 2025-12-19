import Navbar from '../Components/Marvel/Navbar.jsx';
import Hero from '../Components/Marvel/Hero.jsx';
import About from '../Components/Marvel/About.jsx';
import Features from '../Components/Marvel/Features.jsx';
import Story from '../Components/Marvel/Story.jsx';
import UpcomingFilms from '../Components/Marvel/UpcomingFilms.jsx';
import Contact from '../Components/Marvel/Contact.jsx';
import Footer from '../Components/Marvel/Footer.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { FavoritesProvider } from '../context/FavoritesContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';

export default function MarvelHome() {
    return (
        <ToastProvider>
            <AuthProvider>
                <FavoritesProvider>
                    <main className="relative min-h-screen w-screen overflow-x-hidden">
                        <Navbar />
                        <Hero />
                        <About />
                        <Features />
                        <Story />
                        <UpcomingFilms />
                        <Contact />
                        <Footer />
                    </main>
                </FavoritesProvider>
            </AuthProvider>
        </ToastProvider>
    );
}



