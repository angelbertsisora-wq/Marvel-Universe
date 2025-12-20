import React, { useEffect, useRef, useState } from 'react';
import { useWindowScroll } from 'react-use';
import gsap from 'gsap';
import { router } from '@inertiajs/react';
import AuthModal from './AuthModal';
import FavoritesModal from './FavoritesModal';
import { useAuth } from '../../context/AuthContext';

const navitems = ['Log-in', 'Sign-up', 'Favorites'];

const Navbar = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState('login');
    const { user, logout, isAuthenticated } = useAuth();

    const [isaudioplaying, setisaudioplaying] = useState(false);
    const [isindicatoractive, setisindicatoractive] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const[lastScrollY, setLastScrollY] = useState(0);
    const[isNavVisible, setIsNavVisible] = useState(true);

    const navcontainerref = useRef(null);
    const audioelementref = useRef(null);

    {/*for current y scroll property*/}
    const {y : currentScrollY} = useWindowScroll();

    {/* Check if device is mobile/portrait mode */}
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        window.addEventListener('orientationchange', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('orientationchange', checkMobile);
        };
    }, []);

    useEffect( () => {
        // Always keep navbar visible on mobile/portrait mode
        if (isMobile) {
            setIsNavVisible(true);
            if (navcontainerref.current) {
                navcontainerref.current.classList.add('floating-nav');
            }
            return;
        }

        // Desktop scroll behavior
        if(currentScrollY === 0){
            setIsNavVisible(true);
            if (navcontainerref.current) {
                navcontainerref.current.classList.remove('floating-nav'); {/*removes the black background for navbar when it is at top*/}
            }
        } 
        else if(currentScrollY > lastScrollY){ {/*this means user is just scrolling down */}
            setIsNavVisible(false);
            if (navcontainerref.current) {
                navcontainerref.current.classList.add('floating-nav');
            }
        }
        else if(currentScrollY < lastScrollY){ {/*user is scrolling up*/}
            setIsNavVisible(true);
            if (navcontainerref.current) {
                navcontainerref.current.classList.add('floating-nav');
            }
        }

        setLastScrollY(currentScrollY);  {/*this monitors and updates the last scroll*/}
    }, [currentScrollY, lastScrollY, isMobile])

{/*use effect which changes whenever visibilty of navbar changes*/}

    useEffect(() => {
        if (!navcontainerref.current) return;
        
        // Keep navbar always visible on mobile, only animate on desktop
        const shouldHide = !isMobile && !isNavVisible;
        
        gsap.to(navcontainerref.current, {
          y: shouldHide ? -100 : 0,
          opacity: shouldHide ? 0 : 1,
          duration: 0.2,
        })
    }, [isNavVisible, isMobile])


    {/*function for audio playing*/}
    const toggleaudioindicator = () => {
        setisaudioplaying((prev) => !prev);
        setisindicatoractive((prev) => !prev);
    } 

    {/*use effect for audio*/}
    useEffect( () => {
        if(isaudioplaying ) {
            audioelementref.current.play();
        }
        else{
            audioelementref.current.pause();
        }
    }, [isaudioplaying])

    {/* Close mobile menu when modals open */}
    useEffect(() => {
        if (isAuthModalOpen || isFavoritesModalOpen) {
            setIsMobileMenuOpen(false);
        }
    }, [isAuthModalOpen, isFavoritesModalOpen])

    {/* Close mobile menu when clicking outside */}
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && navcontainerref.current && !navcontainerref.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isMobileMenuOpen])

  return (
    <div ref={navcontainerref} className='fixed inset-x-0 top-4 z-50 h-16
    border-none transition-all duration-700 sm:inset-x-6'> {/*inset-x defines left and right positioning*/}

    <header className='absolute top-1/2 w-full -translate-y-1/2'>

    <nav className='flex size-full items-center
    justify-between p-4'>

{/*left side of navbar*/}
        <div className='flex items-center gap-7'>
    <img src="https://res.cloudinary.com/dqbhvzioe/image/upload/v1744102878/logo_acef5r.png" alt="logo" className='w-10'/>
        </div>

    {/*for items in navbar*/}
        <div className='flex h-full items-center'>
            {/* Desktop Navigation */}
            <div className='hidden md:block'>
                {navitems.map((item) => {
                    if (isAuthenticated && item === 'Sign-up') return null;
                    if (!isAuthenticated && item === 'Favorites') return null; // Hide Favorites if not authenticated
                    if (item === 'Log-in' || item === 'Sign-up') {
                        return (
                            <button
                                key={item}
                                className="nav-hover-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (isAuthenticated && item === 'Log-in') {
                                        // If authenticated and clicking "Log-in", show profile or do nothing
                                        return;
                                    }
                                    // Open modal instead of redirecting
                                    setAuthModalTab(item === 'Log-in' ? 'login' : 'signup');
                                    setIsAuthModalOpen(true);
                                }}
                            >
                                {isAuthenticated && item === 'Log-in' ? user?.name || 'Profile' : item}
                            </button>
                        );
                    }
                    if (item === 'Favorites') {
                        return (
                            <button
                                key={item}
                                className="nav-hover-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (isAuthenticated) {
                                        setIsFavoritesModalOpen(true);
                                    } else {
                                        setAuthModalTab('login');
                                        setIsAuthModalOpen(true);
                                    }
                                }}
                            >
                                {item}
                            </button>
                        );
                    }
                    return (
                        <a 
                            key={item}  
                            href={`#${item.toLowerCase()}`} 
                            className="nav-hover-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            {item}
                        </a>
                    );
                })}
                {isAuthenticated && (
                    <button
                        className="nav-hover-btn"
                        onClick={(e) => {
                            e.preventDefault();
                            router.post(route('logout'));
                        }}
                    >
                        Logout
                    </button>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button 
                className='md:hidden ml-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors'
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/*button for music*/}
            <button className='ml-4 md:ml-10 flex items-center
            space-x-0.5' onClick={toggleaudioindicator}>
                <audio ref={audioelementref}
                       className='hidden'
                       src='https://res.cloudinary.com/dqbhvzioe/video/upload/v1744122520/loop_vmragj.mp3'
                       loop/>
                        
                        {/*showing line bars for audio animation*/}
                        {[1,2,3,4].map((bar) => (
                           <div key={bar} className={`indicator-line ${isindicatoractive ? 'active' : ''}`}
                           style={{animationDelay: `${bar * 0.1}s`}}/>

                        ))}
            </button>
        </div>
    </nav>

    {/* Mobile Menu Dropdown */}
    {isMobileMenuOpen && (
        <div className='md:hidden absolute top-full left-0 right-0 mt-2 mx-4 bg-black/95 backdrop-blur-xl rounded-lg border border-white/30 shadow-2xl overflow-hidden animate-fadeInContent'>
            <div className='p-4 space-y-3'>
                {navitems.map((item) => {
                    if (isAuthenticated && item === 'Sign-up') return null;
                    if (!isAuthenticated && item === 'Favorites') return null;
                    
                    if (item === 'Log-in' || item === 'Sign-up') {
                        return (
                            <button
                                key={item}
                                className="w-full text-left px-4 py-3 text-sm uppercase text-white hover:bg-white/10 rounded-lg transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsMobileMenuOpen(false);
                                    if (isAuthenticated && item === 'Log-in') {
                                        return;
                                    }
                                    setAuthModalTab(item === 'Log-in' ? 'login' : 'signup');
                                    setIsAuthModalOpen(true);
                                }}
                            >
                                {isAuthenticated && item === 'Log-in' ? user?.name || 'Profile' : item}
                            </button>
                        );
                    }
                    if (item === 'Favorites') {
                        return (
                            <button
                                key={item}
                                className="w-full text-left px-4 py-3 text-sm uppercase text-white hover:bg-white/10 rounded-lg transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsMobileMenuOpen(false);
                                    if (isAuthenticated) {
                                        setIsFavoritesModalOpen(true);
                                    } else {
                                        setAuthModalTab('login');
                                        setIsAuthModalOpen(true);
                                    }
                                }}
                            >
                                {item}
                            </button>
                        );
                    }
                    return null;
                })}
                {isAuthenticated && (
                    <button
                        className="w-full text-left px-4 py-3 text-sm uppercase text-white hover:bg-white/10 rounded-lg transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsMobileMenuOpen(false);
                            router.post(route('logout'));
                        }}
                    >
                        Logout
                    </button>
                )}
            </div>
        </div>
    )}

    </header>

    {/* Auth Modal */}
    <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
    />

    {/* Favorites Modal */}
    <FavoritesModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
    />

    </div>
  );
};

export default Navbar