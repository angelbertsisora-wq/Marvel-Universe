import React from 'react'
import Button from "./Button";

const ImageClipBox =({src, clipclass}) => (
    <div className={clipclass}>
    <img src={src}/>
</div>
)

const Contact = () => {
  return (
    <div id ="contact" className='my-20 min-h-96 w-screen px-10'>
            <div className='relative rounded-lg
            bg-black py-24 text-blue-50 sm:overflow-hidden'>
                <div className='absolute -left-20 top-0 hidden h-full w-72
               overflow-hidden sm:block lh:left-20 lg:w-96'>
                <ImageClipBox
                clipclass="contact-clip-path-1"
                src="https://res.cloudinary.com/dqbhvzioe/image/upload/v1744102877/contact-1_uz1ptm.webp"
                />
                <ImageClipBox
                clipclass="contact-clip-path-2 lg:translate-y-5 lg:translate-x-10
                translate-y-10"
                src="https://res.cloudinary.com/dqbhvzioe/image/upload/v1744102880/contact-2_hjkj1s.webp"
                />
                </div>

                <div className='absolute -top-40 left-20 w-60
               sm:top-1/2 md:left-auto md:right-10 lg:top-20 lg:w-80'>
                    <ImageClipBox
                clipclass="absolute md:scale-125"
                src="https://res.cloudinary.com/dqbhvzioe/image/upload/v1744102882/avenger-partial_yoxjwa.png"
                />

                    <ImageClipBox
                clipclass="sword-man-clip-path md:scale-125"
                src="https://res.cloudinary.com/dqbhvzioe/image/upload/v1744102883/avenger_jptuyn.png"
                />
               </div>

               <div className='flex flex-col items-center
               text-center'>
                <p className='font-general text-[20px]'>Join Us</p>
                <p className='special-font mt-10 w-full
                font-zentry text-5xl leading-[0.9] md:text-[6rem]'>
                    Let's <b>u</b>nite<br/>the 
                    <b>world's</b> largest <br/> <b>f</b>anbase.</p>
               </div>

            </div>
    </div>
  )
}

export default Contact