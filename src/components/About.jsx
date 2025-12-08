import React from 'react'
import gsap from'gsap';
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/all';
import AnimatedTitle from './AnimatedTitle';
gsap.registerPlugin(ScrollTrigger)


const About = () => {

    useGSAP(() => {
        const clipAnimation = gsap.timeline({
            scrollTrigger: {
                trigger: '#clip', //triggers when the clip id part comes into view
                start: 'center center', //starts when center of viewport aligns with center of viewport
                end: '+=800 center', //animation continues for 800px downwards frm start, element remains at center while scrolling
                scrub: 0.5, //makes animation smoother
                //animation will catch up with scroll with 0.5 delay
                pin: true, //pins the element and rest of element scrolls but that element is fixed
                //till we reach end value
                pinSpacing: true, //GSAP preserves the space the element 
                // would have taken while scrolling,
                //  keeping everything smooth
            },
        });    //allows to create a trigger, start and end more precisely
    
        clipAnimation.to('.mask-clip-path', {

            width:'100vw',
            height:'100vh',
            borderRadius:0,
        });
    
    });
  return (
    <div id='about' className='min-h-screen w-screen'>
        <div className='relative mb-8 mt-36 flex flex-col
        items-center gap-5'>
            <p className='font-general text-sm uppercase 
            md:text-[40px]'>
                    Avengers, Assemble!
            </p>

            {/* creates custom titles*/}
            <AnimatedTitle title=" Welcome to the <br /> <b>M</b>arvel Universe <br />
             where <br /> <b>H</b>eroes are born!"
             containerClass="mt-5 !text-black
             text-center"/>

            

            <div className='about-subtext'>
                <p>
                Strap in, true believer! Adventure, danger, and epic battles await.
                </p>
                <p className='textgray-500'>
                Avengers-level threats? No worries, you are one of us now!
                </p>
            </div>
        </div>

        <div className='h-dvh w-screen' id='clip'>
            <div className='mask-clip-path about-image relative'>
                    <img
                    src='http://res.cloudinary.com/dqbhvzioe/image/upload/v1744102885/about_jpf4ti.webp'
                    alt='background image'
                    className='absolute left-0 top-0
                    size-full object-cover'
                    />
            </div>
        </div>
    </div>
  )
}

export default About