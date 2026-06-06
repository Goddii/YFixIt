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
        <div className='absolute inset-0 -z-10'>
          <div className='absolute top-0 right-0 w-[55%] h-full bg-[#1a3d2b] clip-hero'/>
          <div className='absolute bottom-24 right-[30%] w-40 h-40 rounded-full bg-[#f5a623] opacity-20 blur-2xl'/>
          <div className='absolute top-32 left-[10%] w-24 h-24 rounded-full bg-[#1a3d2b] opacity-10 blur-2xl' />
        </div>
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
                <a href='/signup?role=buyer'
                className='text-center px-8 py-4 rounded-full border-2 border-[#1a3d2b] text-[#1a3d2b] font-bold text-blue hover:bg-[#1a3d2b] hover:text-white transition-all'>
                  Browse Items
                </a>
              </div>
              {/* Trust badges */}
              <div className='flex flex-wrap gap-6 mt-10'>
                {[
                  {icon: '🔒', label: 'Online Payments'},
                  {icon: '📍', label: 'Nairobi & Beyond'},
                  {icon: '⚡', label: 'List in 2 minutes'},
                ].map(({icon, label}) => (
                  <div key= {label} className='flex items-center gap-2 text-sm text-gray-500'>
                    <span className='text-lg'> {icon} </span>
                    <span> {label} </span>
                  </div>
                ))}
              </div>
            </div>
            {/* right floating product card     */}
            <div className='relative hidden lg:flex justify-center items-center h-[480px]'>
              {/* card 1 top left */}
              <div className='absolute top-8 left-4 w-44 bg-white rounded-2xl shadow-xl p-4 rotate-[-4deg] hover:rotate-0 transition-transform duration-300'>
                <div className='bg-[#e8f0eb] rounded-xl h-28 flex flex items-center justify-center text-4xl mb-3'>📱</div>
                <p className='font-bold text-sm text-[#1a1a1a]'> Samsung S21 Screen</p>
                <p className='text-xs text-gray-400 mt-0.5'>Cracked - Nairobi CBD</p>
                <p className='text-[#f5a623] font-extrabold mt-2 text-sm'>Ksh 2,500</p>
                <span className='inline-block mt-1 text-[10px] bg-red-100 text-red-600 font-semibold px-2 pt-0.5 rounded-full'>Broken</span>
              </div>
              {/* card 2 center */}
              <div className='absolute top-20 right-8 w-44 bg-white rounded-2xl shadow-xl rotate-[3deg] hover:rotate-0 transition-transform duration-300'>
                <div className='bg-[#fef3e2] rounded-xl h-28 flex items-center justify-center text-4xl mb-3'>💻</div>
                  <p className='font-bold text-sm text-[#1a1a1a] px-1.5'>Dell Laptop Charger</p>
                  <p className='text-xs text-gray-400 mt-0.5 px-1.5'>Good - Westlands</p>
                  <p className='text-[#f5a623] font-extrabold mt-2 text-sm px-1.5'>Ksh 800</p>
                  <span className='inline-block mt-1 text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 mb-0.5 rounded-full'>Good</span>
              </div>
              {/* card 3 bottom */}
              <div className='absolute bottom-1 left-16 w-44 bg-white rounded-2xl shadow-xl p-4 rotate-[2deg] hover:rotate-0 transition-transform duration-300'>
                <div className='bg-[#e8f0eb] rounded-xl h-28 flex items-center justify-center text-4xl mb-3'>🎧</div>
                <p className='font-bold text-sm text-[#1a1a1a]'> Sony Headphones</p>
                <p className='text-xs text-gray-400 mt-0.5'>Fair - Thika Town</p>
                <p className='text-[#f5a623] font-extrabold mt-2 text-sm'> ksh 1,200</p>
                <span className='inline-block mt-1 text-[10px] bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full'>Fair</span>
              </div>  
            </div>
          </div>
        </div> 
        
      </section>
      {/* how it works section  */}          
      <section id='how-it-works' className='py-24 bg-white'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <span className='text-[#f5a623] font-bold uppercase tracking-widest text-xs'>Simple Process</span>
            <h2 className='text-3xl sm:text-4xl font-extrabold mt-2 text-[#1a1a1a]'>How YFixIt works</h2>
            <p className='text-gray-500 mt-3 max-w-xl mx-auto'>Whether you're clearing out old devices or hunting for a spare part- we've got you</p>
          </div>
          {/* Two columns : Sellers | Buyers */}
          <div className='grid md:grid-cols-2 gap-10'>
            {/* sellers */}
            <div className='bg-[#1a3d2b] rounded-3xl p-8 text-white'>
              <p className='text-[#f5a623] font-bold uppercase tracking-widest text-xs mb-4'>For Sellers</p>
              <h3 className='text-2xl font-extrabold mb-8'>List your item in minutes</h3>
              {[
                {step: '01', title: 'Creaate a Seller Account', desc: 'Sign up with your phone number or email -takes 60 seconds'},
                {step: '02', title: 'Post your Item', desc:'Add photos, set  price, pick a condition (Broken /Fair /Good) and your location'},
                {step: '03', title: 'Get paid to your bank account or mpesa', desc:'When buyer pays, funds land in your account'},
              ].map(({step, title, desc}) => (
                <div key={step} className='flex gap-4 mb-6 last:mb-0'>
                  <span className='text-[#f5a623] font-extrabold text-lg w-8 shrink-0'>{step}</span>
                  <div>
                    <p className='font-bold text-base'> {title} </p>
                    <p className='text-white/60 text-sm mt-1'>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Buyers */}
            <div className='bg-[#f7f3ed] rounded-3xl p-8 border-2 border-[#e5ddd1]'>
              <p className='text-[#1a3d2b] font-bold uppercase tracking-widest text-xs mb-4'>For Buyers</p>
              <h3 className='text-2xl font-extrabold text-[#1a1a1a] mb-8'>Find exactly what you need</h3>
              {[
                {step: '01', title: 'Browse or Search', desc: 'Filter by category, condition, location, or price range'},
                {step: '02', title: 'Contact the Seller', desc: 'Message them directly through the platform before committing'},
                {step: '03', title: 'Pay Safely', desc: 'Checkout via bank or mpesa,no cash, no-risks, no stress'},
              ].map(({step, title, desc}) =>(
                <div key={step} className='flex gap-4 mb-6 last:mb-0'>
                  <span className='text-[#1a3d2b] font-extrabold text-lg w-8 shrink-0'>{step}</span>
                  <div>
                    <p className='font-semibold text-base text-[#1a1a1a]'>{title}</p>
                    <p className='text-gray-500 text-sm mt-1'>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>
      {/* Stats section */}
      <section className='bg-[#f56a23] py-14'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
            {[
              {value: 'Free', label: 'To list an item'},
              {value: '2min', label: 'Average listing time'},
              {value: 'Mpesa, bank', label:' Secure payments'},
              {value: 'Kenya', label: 'Nationwide'}
            ].map(({value, label})=> (
              <div key={label}>
                <p className='text-3xl font-extrabold text-[#1a3d2b]'> {value} </p>
                <p className='text-sm text-[#1a3d2b]/70 mt-1 font-medium'>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* cta banner section */}
      
    </div>
  )
}

export default App
