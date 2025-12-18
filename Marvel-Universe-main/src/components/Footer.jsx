import React from 'react'
import { FaDiscord, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'

const links = [
    {href: '#', icon: <FaDiscord/>},
    {href: '#', icon: <FaTwitter/>},
    {href: '#', icon: <FaYoutube/>},
    {href: '#', icon: <FaInstagram/>},
]

const Footer = () => {
  return (
    <footer className='w-screen bg-purple-700 py-4 text-black'>
            <div className='container mx-auto flex flex-col items-center
            justify-between gap-4 px-4 md:flex-row'>
                    <p className='text-center text-sm md:text-left'>
                        &copy; Group7-2025. All rights reserved
                    </p>
                    <div className='flex justify-center gap-4 md:justify-start'>
                            {links.map((link) => (
                                <a key={link} href={link.href} target="_blank"
                                rel='noopener noreferrer' className='text-black 
                                transition-colors duration-500 ease-in-out hover:text-white'>
                                    {link.icon}
                                </a>
                            ))}
                    </div>
            </div>
    </footer>
  )
}

export default Footer