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

            {/* CTA button */}
            <div className='hidden md:flex items-center gap-3'>
              <a href='/login' className='text-sm font-semibold px-4 py-2 rounded-full border-2 border-[#1a3d2b] text-[#1a3d2b] hover:bg-[#1a3d2b] hover:text-white transition-all' style={{borderColor: scrolled ? "white" : "#1a3d2b", color: scrolled ? "white" : '#1a3d2b'}}>
              Log in
              </a>
              <a href='/signup' className='text-sm font-semibold px-4 py-2 rounded-full bg-[#f5a623] text-[#1a1a1a] hover:bg-amber-500 transition-all shadow'>
                Get Started
              </a>
            </div>

            {/* Mobile hamburger */}
            <button className='md:hidden p-2' onClick={() => setMenuOpen(!menuOpen)} aria-label='Toggle menu'>
                <div className={'w-6 h-0.5 transition-all ${scrolled ? "bg-white" : "bg-[#1a3d2b]"}'}></div>
            </button>

          </div>

        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className='md:hidden bg-[#1a3d2b] px-6 pb-6 pt-2 flex flex-col gap-4'>
            {['Browse', 'How it works', 'About'].map((link)=> (
              <a key={link}
              href={'{link.toLowerCase}'}
              className='text-white text-base font-medium hover:text-[#f5a623] transition-colors' 
              onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <div className='flex gap-3 mt-2'>
              <a href='/login' className='flex-1 text-center text-sm font-semibold py-2 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#1a3d2b] transition-all'>
              Log in
              </a>
              <a href='/signup' className='flex-1 text-center text-sm font-semibold py-2 rounded-full bg-[#f5a623] text-[#1a1a1a] hover:bg-amber-500 transition-all'>
              Get Started
              </a>
            </div>
          </div>
        )}

      </nav>
    </div>
  )
}

export default App
