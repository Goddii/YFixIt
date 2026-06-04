import { useEffect, useState } from 'react'
import './App.css'

function App() {

  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [])
  

  return (
    <div className='font-sans bg-[#f7f3ed] text-[#1a1a1a] min-h-screen'>
      
      {/* Navbar */}
      <nav className={'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#1a3d2b] shadow-lg" : "bg-transparent"}'}>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* logo */}
            <a href='#' className='flex items-center gap-2'>
              <span className='text-[#f5a623] text-2xl'>⚙</span>
              <span className={'font-extrabold text-xl tracking-tight transition-colors ${ scrolled ? "text-white" : "text-[#1a3d2b]"}'}>
                YFixIt
              </span>
            </a>
            {/* Desktop nav links */}
            <div className='hidden md:flex items-center gap-8'>
              {['Browse', 'How it works', 'About'].map((link)=> (
                <a key={link} href={'#${link.toLowerCase().replace(/ /g, "-")}'} className={'text-sm font-medium transition-colors hover:text-[#f5a623] ${ scrolled ? "text-white":"text-[#1a3d2b]"}'}>
                  {link}
                </a>
              ))}
            </div>

          </div>

        </div>

      </nav>
    </div>
  )
}

export default App
