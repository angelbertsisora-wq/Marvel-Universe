import React, {useRef} from 'react'
import AnimatedTitle from './AnimatedTitle'
import gsap from 'gsap';

const Story = () => {

    const frameref = useRef('null');

    const handlemouseleave = () => {
        const element = frameref.current;
        gsap.to(element, {
            duration: 0.1,
            rotateX:0,
            rotateY:0,
            ease: 'power1.inOut',
        })
    }

    const handlemousemove = (e) => {
            const {clientX, clientY} = e;
            const element = frameref.current;

            if(!element) return;

            const rect = element.getBoundingClientRect();
            const x = clientX  - rect.left;
            const y = clientY - rect.top;

            const centerX = rect.width/2;
            const centerY = rect.height/2;

            const rotateX = ((y- centerY)/ centerY) * -10;
            const rotateY = ((x- centerX)/centerX) *  10;

            gsap.to(element, {
                duration: 0.1,
                rotateX, rotateY,
                transformPerspective: 500,
                ease: 'power1.inOut',
            })

    }

  return (
    <section id="story" className='min-h-dvh w-screen bg-black text-blue-50'>
        <div className='flex size-full flex-col 
        items-center py-10 pb-24'>
            <p className='font-general !text-lg uppercase
            md:text-[10px]'>Marvel in Pages</p>
            <div className='relative size-full'>
                <AnimatedTitle
                title="<b>Epic</b>-Tales<br/><b>Marvel</b>Comics"
                 sectionId = "#story"
                 containerClass="mt-5 pointer-events-none 
                 mix-blend-difference relative z-10"/>

                 <div className='story-img-container'>
                    <div className='story-img-mask'>
                        <div className='story-img-content'>
                                <img 
                                ref ={frameref}
                                onMouseLeave={handlemouseleave}
                                onMouseUp={handlemouseleave}
                                onMouseEnter={handlemouseleave}
                                onMouseMove={handlemousemove}
                                src="https://res.cloudinary.com/dqbhvzioe/image/upload/v1744102885/story_uabcoa.webp"
                                alt='storyimg'
                                className='object-contain'/>

                        </div>

                    </div>

                 </div>
            </div>

            <div className='-mt-80 flex w-full
            justify-center md:-mt-64 md:me-44 md:justify-end'>
                <div className='flex h-full w-fit flex-col items-center
                md:items-start'>
                    <p className='mt-3 max-w-sm text-center
                    font-circular-web text-violet-50 md:text-start'>
                    Dive into the legendary world of Marvel Comics!
                     Explore iconic storylines, discover new releases,
                      and find essential reading
                     guides for both newcomers and longtime fans.
                    </p>

                </div>

            </div>
        </div>
    </section>
  )
}

export default Story