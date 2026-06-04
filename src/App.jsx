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
      
      
    </div>
  )
}

export default App
