import {useParams, Link} from 'react-router-dom'

// mock data
const LISTINGS = [
    { id: 1, title: "Samsung S21 Cracked Screen", category: "Phones", condition: "Broken", price: 2500, location: "Nairobi CBD", image: "📱", seller: "Wanjiku M.", posted: "2h ago", description: "Samsung S21 screen with a cracked top-left corner. Touch still works perfectly on 90% of the screen. Great for repair shops or someone who can replace the glass. Comes with original packaging. Negotiable for serious buyers.", phone: "0712345678" },
    { id: 2, title: "Dell Laptop Charger 65W", category: "Laptops", condition: "Good", price: 800, location: "Westlands", image: "🔌", seller: "Brian O.", posted: "5h ago", description: "Original Dell 65W charger. Works perfectly, no fraying. Selling because I upgraded my laptop to a USB-C model. Collection preferred but can arrange delivery within Nairobi.", phone: "0723456789" },
    { id: 3, title: "Sony WH-1000XM3 Headphones", category: "Audio", condition: "Fair", price: 3200, location: "Thika Town", image: "🎧", seller: "Amina K.", posted: "1d ago", description: "Sony noise-cancelling headphones. Left ear cushion has some wear but sound quality is excellent. ANC works great. Selling because I got a newer model. Comes with carry case and cables.", phone: "0734567890" },
    { id: 4, title: "HP Pavilion Motherboard", category: "Laptops", condition: "Broken", price: 1500, location: "Mombasa Rd", image: "💻", seller: "Otieno J.", posted: "1d ago", description: "HP Pavilion 15 motherboard. Dead — does not power on. Good for parts harvesting. RAM slots and GPU connector appear intact. Ideal for repair technicians.", phone: "0745678901" },
    { id: 5, title: "iPhone 12 Battery", category: "Phones", condition: "Good", price: 1200, location: "Kilimani", image: "🔋", seller: "Grace N.", posted: "2d ago", description: "Genuine Apple iPhone 12 battery, removed from a phone that had a cracked screen. Battery health was at 94% before removal. Tested and working.", phone: "0756789012" },
    { id: 6, title: "Samsung 32\" Monitor", category: "Monitors", condition: "Fair", price: 7500, location: "Kasarani", image: "🖥️", seller: "Peter M.", posted: "2d ago", description: "Samsung 32-inch FHD monitor. Small scratch on bezel (not on screen). HDMI and VGA ports both functional. Stand included. Great for home office setup.", phone: "0767890123" },
    { id: 7, title: "Xbox One Controller", category: "Gaming", condition: "Good", price: 2000, location: "Nairobi CBD", image: "🎮", seller: "Collins R.", posted: "3d ago", description: "Xbox One wireless controller, barely used. All buttons responsive. Comes with USB cable. No battery cover crack. Selling because I switched to PC gaming.", phone: "0778901234" },
    { id: 8, title: "Canon EOS 600D Body", category: "Cameras", condition: "Fair", price: 18000, location: "Westlands", image: "📷", seller: "Fatuma A.", posted: "3d ago", description: "Canon 600D body only (no lens). Shutter count around 12,000. Minor scuffs on the bottom. All dials and buttons work. Viewfinder is clear. Great entry-level DSLR for learning photography.", phone: "0789012345" },
    { id: 9, title: "Lenovo ThinkPad Keyboard", category: "Laptops", condition: "Good", price: 600, location: "Upperhill", image: "⌨️", seller: "David K.", posted: "4d ago", description: "Lenovo ThinkPad T series replacement keyboard. All keys work, no missing keycaps. Removed during an upgrade. Compatible with T430, T440 series.", phone: "0790123456" },
    { id: 10, title: "JBL Flip 4 Speaker", category: "Audio", condition: "Broken", price: 1800, location: "Parklands", image: "🔊", seller: "Mercy W.", posted: "4d ago", description: "JBL Flip 4 that powers on but has distorted audio on the right channel. Good for someone who can repair speakers or wants it for parts. Battery still holds charge for about 4 hours.", phone: "0701234567" },
    { id: 11, title: "Huawei P30 Lite Back Glass", category: "Phones", condition: "Broken", price: 400, location: "Thika Town", image: "📱", seller: "James L.", posted: "5d ago", description: "Cracked back glass from a Huawei P30 Lite. Camera lens is intact. Good for repair shops needing the frame or camera module. Phone itself is not included.", phone: "0712345670" },
    { id: 12, title: "Logitech MX Master Mouse", category: "Accessories", condition: "Good", price: 3500, location: "Karen", image: "🖱️", seller: "Stella N.", posted: "5d ago", description: "Logitech MX Master 2S wireless mouse. All buttons and scroll wheel work perfectly. USB receiver included. Minor wear on the right click button surface. Battery lasts about 40 days on a charge.", phone: "0723456780" },
]

const CONDITION_STYLES = {
    Good:   { badge: "bg-green-100 text-green-700", label: "✅ Good condition" },
    Fair:   { badge: "bg-yellow-100 text-yellow-700", label: "⚠️ Fair condition" },
    Broken: { badge: "bg-red-100 text-red-600", label: "🔧 Broken / for parts" },
}

const RELATED_LABEL = {
    Good:   "This item is in good working condition with minor cosmetic wear.",
    Fair:   "This item works but has visible signs of use or minor faults.",
    Broken: "This item is non-functional and sold for repair or parts only.",
}

export default function ListingDetail() {
    const { id } = useParams()
    const item = LISTINGS.find((l) => l.id === Number(id))

    // 404 state
    if (!item) {
        return (
            <div className='min-h-screen bg-[#f7f3ed] flex flex-col items-center justify-center gap-4'>
                <p className='text-6xl'>😕</p>
                <h1 className='text-2xl font-extrabold text-[#1a1a1a]'>Listing not found</h1>
                <p className='text-gray-500 text-sm'>It may have been sold or removed</p>
                <Link to='/browse' className='mt-2 px-6 py-3 rounded-full bg-[#1a3d2b] text-white font-bold text-sm hover:bg-[#14301f] transition-all'>
                ← Back to Browse
                </Link>
            </div>
        )
    }
    const cond = CONDITION_STYLES[item.condition]

    // related listings
    
    return (
        <div className='min-h-screen bg-[#f7f3ed]'>
            {/* navbar */}
            <nav className='bg-[#1a3d2b] sticky top-0 z-40 shadow-md'>
                <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between'>
                    <Link to='/' className='flex items-center gap-2'>
                        <span className='text-[#f5a623] text-xl'>⚙</span>
                        <span className='font-extrabold text-lg text-white'>YFixIt</span>
                    </Link>
                    <div className='flex items-center gap-3'>
                        <Link to='/browse' className='text-white/70 hover:text-white text-sm font-medium transition-colours'>
                            ← Browse
                        </Link>
                        <Link to='/signup?role=seller' className='text-xs sm:text-sm font-bold px-3 py-2 rounded-full bg-[#f5a623] text-[#1a1a1a] hover:bg-amber-500 transition-all'>
                            + List Item    
                        </Link>
                        
                    </div>
                </div>

            </nav>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* breadcrumb */}
                <div className='flex items-center gap-2 text-xs text-gray-400 mb-6'>
                    <Link to='/' className='hover-[#1a3d2b] transition-colors'>Home</Link>
                    <span>/</span>
                    <Link to='/browse' className='hover:text-[#1a3d2b] transition-colors'>Browse</Link>
                    <span>/</span>
                    <span className='text-[#1a1a1a] font-medium'>{item.title}</span>
                </div>
                <div className='grid lg:grid-cols-5 gap-8'>
                    {/* left image details */}
                    <div className='lg:col-span-3 flex flex-col gap-6'>
                        {/* main image */}
                        <div className='bg-white rounded-3xl shadow-sm overflow-hidden'>
                            <div className='bg-[#f7f3ed] h-72 sm:h-96 flex items-center justify-center text-8xl sm:text-9xl'>
                                {item.image}
                            </div>
                            {/* Thumbnail strip placeholder */}
                            <div className='flex gap-3 p-4'>
                                {[1,2,3].map((i) => (
                                    <div key={i} className={`w-16 h-16 rounded-xl bg-[#f7f3ed] flex items-center justify-center text-2xl cursor-pointer transition-all ${i === 1 ? "bg-[#e8f0eb] ring-2 ring-[#1a3d2b]": "bg-[#f7f3ed] hover:bg-[#e8f0eb]" }  `}>
                                        {item.image}               
                                    </div>
                                ))}
                                <div className='w-16 h-16 rounded-xl bg-[#f7f3ed] flex item-center justify-center text-xs text-gray-400 font-medium cursor-pointer hover:bg-[#e8f0eb] transition-all'>
                                    + 3
                                </div>
                            </div>
                        </div>
                        {/* description */}
                        <div className='bg-white rounded-3xl shadow-sm px-6'>
                            <h2 className='font-extrabold text-[#1a1a1a]text-lg mb-3'> About this item</h2>
                            <p className='text-gray-600 text-sm leading-relaxed'>{item.description}</p>
                            {/* condition note */}
                            <div className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${cond.badge}`}>
                                {cond.label} - {RELATED_LABEL[item.condition]}
                            </div>
                        </div>
                        {/* item details table */}
                        <div className='bg-white rounded-3xl shadow-sm p-6 '></div>
                    </div>
                </div>
            </div>

        </div>
    )

}
