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

      {/* Hero */}
      <section className='relative min-h-screen flex items-center overflow-hidden'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-20'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            {/* left copy */}
            <div>
              <span className='inline-block bg-[#f5a623]/20 text-[#b57d10] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5' >
              Kenya's Electronic Marketplace
              </span>
              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6'>
                Sell what's{" "}
                <span className='text-[#f5a623]'>broken</span>
                <br/>
                Buy what's{" "}
                <span className='text-[#1a3d2b]'>useful</span>
              </h1>
              <p className='text-gray-600 text-lg mb-8 max-w-md leading-relaxed'>
                YFixIt connects Kenyans selling broken electronics and second-hand items with buyers who can fix, repurpose, or resell them — all in one place.
              </p>
              <div className='flex flex-col sm:flex-row gap-4'>
                <a href='/signup?role=seller' className='text-center px-8 py-4 rounded-full bg-[#1a3d2b] text-white font-bold text-base hover:bg-[#14301f] transition-all shadow-lg hover:shadow-xl hover:translate-y-0.5'>
                Start Selling
                </a>
              </div>
            </div>
          </div>
        </div>
        
     

      </section>
    </div>
  )
}

export default App
