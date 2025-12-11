import React, { useRef, useState, useEffect } from 'react';
import { TiLocationArrow } from "react-icons/ti"; 

// Lazy loading video card component
const LazyVideoCard = ({ src }) => {
    const videoRef = useRef(null);
    const cardRef = useRef(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShouldLoad(true);
                        observer.disconnect();
                    }
                });
            },
            { rootMargin: '150px' }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (shouldLoad && videoRef.current && src) {
            videoRef.current.src = src;
            videoRef.current.load();
            videoRef.current.play().catch(() => {
                // Ignore autoplay errors
            });
        }
    }, [shouldLoad, src]);

    return (
        <div ref={cardRef} className='size-full'>
            {shouldLoad ? (
                <video
                    ref={videoRef}
                    loop
                    muted
                    autoPlay
                    preload="none"
                    className='size-full object-cover object-center'
                />
            ) : (
                <div className='size-full bg-black/50' />
            )}
        </div>
    );
};

// for creating the tilt effect in features cards
const BentoTilt =({children, className =''}) => {

    const[transformStyle, setTransformStyle] = useState('');
    const itemref = useRef();

    const handlemousemove = (e) => {
        if(!itemref.current) return;

        const { left, top, width, height } = itemref.current.getBoundingClientRect();

        const relativeX = (e.clientX -left) / width;
        const relativeY = (e.clientY -top) / height;

        const tiltX = (relativeY-0.5) * 30;
        const tiltY = (relativeX-0.5) * -30;

        const newTransform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(0.96,0.96,0.96)`

        setTransformStyle(newTransform)
    }

    const handlemouseleave = () => {
        setTransformStyle('');
    }

    return (
        <div className={className} ref={itemref}
        onMouseMove={handlemousemove} onMouseLeave={handlemouseleave}
        style = {{transform: transformStyle}}>
            {children}
        </div>
    )
}



const BentoCard = ({src, title, description}) => {
    const videoRef = useRef(null);
    const cardRef = useRef(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShouldLoad(true);
                        observer.disconnect();
                    }
                });
            },
            { rootMargin: '150px' } // Start loading before entering viewport
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (shouldLoad && videoRef.current && src) {
            videoRef.current.src = src;
            videoRef.current.load();
            videoRef.current.play().catch(() => {
                // Ignore autoplay errors
            });
        }
    }, [shouldLoad, src]);

    return (
        <div ref={cardRef} className='relative size-full'>
            {shouldLoad ? (
                <video
                    ref={videoRef}
                    loop
                    muted
                    type="video/mp4"
                    playsInline
                    autoPlay
                    preload="none"
                    className='absolute left-0 top-0 size-full object-cover object-center'
                />
            ) : (
                <div className='absolute left-0 top-0 size-full bg-black/50' />
            )}

            <div className='relative z-10 flex size-full flex-col justify-between p-5 text-blue-50'>
                <div>
                    <h1 className='bento-title special-font'>{title}</h1>
                    {description && (
                        <p className='mt-3 max-w-64 text-xs md:text-base'>{description}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

const Features = () => {
  return (
    <section className='bg-black pb-50'>
        <div className='container mx-auto px-3 md:px-10'>
        <div className='px-5 py-32'>
                <p className='font-circular-web text-lg text-blue-50'>Into the Marvel Multiverse</p>

        <p className='max-w-md  font-circular-web text-lg text-blue-50 opacity-60'>
        Dive into the vast Marvel Multiverse, 
        where endless possibilities unfold across alternate 
        timelines, parallel dimensions, and unexpected crossovers.
         From iconic heroes reimagined to entirely new worlds,
          the multiverse offers infinite adventures beyond
           imagination. 
        </p>
        </div>
        

        <BentoTilt className='border-hsla relative mb-7 h-95 w-full overflow-hidden rounded-md md:h-[65vh]'>
            <BentoCard
            src="/heroes.mp4"
            title = {<><b>Heroes</b></>}
            description="Meet the iconic protectors of the universe,
             from Iron Man and Spider-Man to Doctor Strange 
             and Black Panther."
           
            />
        </BentoTilt>

            <div className='grid h-[135vh] grid-cols-2 grid-rows-3 gap-7'>
                    <BentoTilt className='bento-tilt_1 row-span-1 md:col-span-1 md:row-span-2'>
                                <BentoCard
                                    src="https://res.cloudinary.com/djef7fggp/video/upload/v1765185113/villains_m9gkp1.3gp"
                                    title={<><b>Villains</b></>}
                                    description={"Explore the minds of Marvel’s greatest threats, including Thanos, Loki, Kang, and the Green Goblin."}
                                 />
                    </BentoTilt>

                    <BentoTilt className='bento-tilt_1 row-span-1 ms-32 md:col-span-1 md:ms-0'>
                            <BentoCard
                            src="https://res.cloudinary.com/dqbhvzioe/video/upload/v1744102674/feature-3_k3tnrx.mp4"
                            title={<><b>Teams</b></>}
                            description="Discover the power of unity with groups like the Avengers and the Guardians of the Galaxy."
                            />
                    </BentoTilt>

                    <BentoTilt className='bento-tilt_1 me-14 md:col-span-1 md:me-0'>
                            <BentoCard
                            src="https://res.cloudinary.com/djef7fggp/video/upload/v1765185755/allies_zmaezo.3gp"
                            title={<><b>Allies</b></>}
                            description="The mentors, sidekicks, and allies who make a difference, such as Nick Fury and Pepper Potts."
                            />
                    </BentoTilt>

                    <BentoTilt className='bento-tilt_2'>
                        <div className='flex size-full flex-col justify-between bg-pink-300 p-5'>
                            <h1 className='bento-title special-font max-w-64 text-black'>M<b>o</b>re Co<b>m</b>ing so<b>o</b>n!</h1>
                            <TiLocationArrow className='m-5 scale-[5] self-end'/>

                        </div>

                    </BentoTilt>

                    <BentoTilt className='bento-tilt_2'>
                            <LazyVideoCard
                            src='https://res.cloudinary.com/dqbhvzioe/video/upload/v1744102683/feature-5_lfdc9j.mp4'
                            />
                    </BentoTilt>

            </div>

        </div>
    </section>
  )
}

export default Features