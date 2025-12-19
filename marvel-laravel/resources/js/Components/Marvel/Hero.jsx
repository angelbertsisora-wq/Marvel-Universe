
import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasClicked, setHasClicked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadedVideos, setLoadedVideos] = useState(0);
    const [videoUrls, setVideoUrls] = useState([]);

    const totalVideos = 3;
    const nextVdRef = useRef(null);
    const mainVideoRef = useRef(null);
    
    // Use Laravel public path for video asset
    const videoSrc = '/Marvel_Intro.mp4';

    const handleVideoLoad = (e) => {
        console.log("Video loaded successfully:", e.target.src);
        setLoadedVideos((prev) => prev + 1);
        // Ensure video plays when loaded
        if (mainVideoRef.current && e.target === mainVideoRef.current) {
            mainVideoRef.current.play().catch((e) => {
                console.error("Video play error:", e);
            });
        }
    };

    const upcomingVideoIndex = (currentIndex % totalVideos) + 1;

    const handleMiniVdClick = () => {
        setHasClicked(true);
        setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);

        setTimeout(() => {
            if (nextVdRef.current) {
                nextVdRef.current.load();
                nextVdRef.current.play().catch((e) => console.error("Playback error:", e));
            }
        }, 200);
    };

    useEffect(() => {
        // For single video, hide loading once video is loaded
        if (loadedVideos >= 1) {
            setIsLoading(false);
        }
    }, [loadedVideos]);

    // Reset videos when component mounts or when scrolling back to top
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY === 0 && mainVideoRef.current) {
                // Reset video state when at top
                mainVideoRef.current.load();
                mainVideoRef.current.play().catch(() => {});
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Ensure video plays on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            if (mainVideoRef.current) {
                console.log("Attempting to play video:", mainVideoRef.current.src);
                mainVideoRef.current.play().catch((e) => {
                    console.error("Initial video play error:", e);
                });
            } else {
                console.warn("Main video ref is not available");
            }
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    useGSAP(() => {
        if (hasClicked) {
            gsap.set('#next-Video', { visibility: 'visible' });
            gsap.to('#next-Video', {
                transformOrigin: 'center center',
                scale: 1,
                width: '100%',
                height: '100%',
                duration: 1,
                ease: 'power1.inOut',
                onStart: () => nextVdRef.current.play(),
            });

            gsap.from('#current-video', {
                transformOrigin: 'center center',
                scale: 0,
                duration: 1.5,
                ease: 'power1.inOut',
            });
        }
    }, { dependencies: [currentIndex], revertOnUpdate: true });

    useGSAP(() => {
        gsap.set('#video-frame', {
            clipPath: 'polygon(14% 0%, 72% 0%, 90% 90%, 0% 100%)',
            borderRadius: '0 0 40% 10%'
        });

        gsap.from('#video-frame', {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            borderRadius: '0 0 0 0',
            ease: 'power1.inOut',
            scrollTrigger: {
                trigger: '#video-frame',
                start: 'center center',
                end: 'bottom center',
                scrub: true,
            }
        });
    });

    const getVideoSrc = (index) => {
        if (videoUrls.length > 0) {
            return videoUrls[index % videoUrls.length];
        }
        return '';
    };

    return (
        <div className="relative h-dvh w-screen overflow-x-hidden">
            {/* Loading Spinner */}
            {isLoading && (
                <div className='flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-violet-50'>
                    <div className='three-body'>
                        <div className='three-body__dot' />
                        <div className='three-body__dot' />
                        <div className='three-body__dot' />
                    </div>
                </div>
            )}

            {/* Main Video Container */}
            <div id="video-frame" className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75">
                <div>
                    {/* Mini Video Preview */}
                    <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
                        <div
                            onClick={handleMiniVdClick}
                            className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
                        >
                            <video
                                ref={nextVdRef}
                                src={videoSrc}
                                loop
                                muted
                                playsInline
                                preload="none"
                                id="current-video"
                                className="size-64 origin-center scale-150 object-cover object-center"
                                onLoadedData={handleVideoLoad}
                            />
                        </div>
                    </div>

                    {/* Next Video */}
                    <video
                        ref={nextVdRef}
                        src={videoSrc}
                        loop
                        muted
                        preload="none"
                        id='next-Video'
                        className='absolute-center invisible absolute z-20 size-64 object-cover object-center'
                        onLoadedData={handleVideoLoad}
                    />

                    {/* Main Background Video */}
                    <video
                        ref={mainVideoRef}
                        src={videoSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        className='absolute left-0 top-0 size-full object-cover object-center'
                        onLoadedData={handleVideoLoad}
                        onError={(e) => {
                            console.error("Video loading error:", e);
                            setIsLoading(false);
                        }}
                    />
                </div>

                {/* Overlay Text - Inevitable (ensure it stays on top) */}
                <h1 className='special-font hero-heading absolute bottom-5 right-5 z-50 text-blue-75'>
                    <b>Inevitable</b>
                </h1>

                {/* Main Content */}
                <div className='absolute left-0 top-0 z-40 size-full'>
                    <div className='mt-24 px-5 sm:px-10'>
                        <h1 className='special-font hero-heading text-blue-100'>
                            <b>Marvel</b>
                        </h1>

                        <p className='mb-5 max-w-64 font-robert-regular text-blue-100'>
                            Are you ready for war? <br />
                            Unleash the power
                        </p>
                    </div>
                </div>
            </div>

            {/* Overlay Text - Avengers Assemble */}
            <h1 className='special-font hero-heading absolute bottom-5 right-5 text-black'>
                <b>Avengers Assemble</b>
            </h1>
        </div>
    );
};

export default Hero;
