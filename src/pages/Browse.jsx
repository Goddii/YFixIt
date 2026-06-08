import { useState } from "react";
import { Link } from "react-router-dom";

const LISTINGS = [
  { id: 1, title: "Samsung S21 Cracked Screen", category: "Phones", condition: "Broken", price: 2500, location: "Nairobi CBD", image: "📱", seller: "Wanjiku M.", posted: "2h ago" },
  { id: 2, title: "Dell Laptop Charger 65W", category: "Laptops", condition: "Good", price: 800, location: "Westlands", image: "🔌", seller: "Brian O.", posted: "5h ago" },
  { id: 3, title: "Sony WH-1000XM3 Headphones", category: "Audio", condition: "Fair", price: 3200, location: "Thika Town", image: "🎧", seller: "Amina K.", posted: "1d ago" },
  { id: 4, title: "HP Pavilion Motherboard", category: "Laptops", condition: "Broken", price: 1500, location: "Mombasa Rd", image: "💻", seller: "Otieno J.", posted: "1d ago" },
  { id: 5, title: "iPhone 12 Battery", category: "Phones", condition: "Good", price: 1200, location: "Kilimani", image: "🔋", seller: "Grace N.", posted: "2d ago" },
  { id: 6, title: "Samsung 32\" Monitor", category: "Monitors", condition: "Fair", price: 7500, location: "Kasarani", image: "🖥️", seller: "Peter M.", posted: "2d ago" },
  { id: 7, title: "Xbox One Controller", category: "Gaming", condition: "Good", price: 2000, location: "Nairobi CBD", image: "🎮", seller: "Collins R.", posted: "3d ago" },
  { id: 8, title: "Canon EOS 600D Body", category: "Cameras", condition: "Fair", price: 18000, location: "Westlands", image: "📷", seller: "Fatuma A.", posted: "3d ago" },
  { id: 9, title: "Lenovo ThinkPad Keyboard", category: "Laptops", condition: "Good", price: 600, location: "Upperhill", image: "⌨️", seller: "David K.", posted: "4d ago" },
  { id: 10, title: "JBL Flip 4 Speaker", category: "Audio", condition: "Broken", price: 1800, location: "Parklands", image: "🔊", seller: "Mercy W.", posted: "4d ago" },
  { id: 11, title: "Huawei P30 Lite Back Glass", category: "Phones", condition: "Broken", price: 400, location: "Thika Town", image: "📱", seller: "James L.", posted: "5d ago" },
  { id: 12, title: "Logitech MX Master Mouse", category: "Accessories", condition: "Good", price: 3500, location: "Karen", image: "🖱️", seller: "Stella N.", posted: "5d ago" },
]

const CATEGORIES = ['All', 'Phones', 'Laptops', 'Audio', 'Monitors', 'Gaming', 'Cameras', 'Accessories'];
const CONDITIONS = ['All', 'Good', 'Fair', 'Broken']
const LOCATIONS = ['All', 'Nairobi CBD', 'Westlands', 'Thika Town', 'Kilimani','Kasarani', 'Mombasa Rd', 'Upperhill', 'Karen', 'Parklands']

const CONDITION_STYLES = {
    Good: "bg-green-100 text-green-700",
    Fair: "bg-yellow-100 text-yellow-700",
    Broken: "bg-red-100 text-red-600"
}

export default function Browse() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All')
    const [condition, setCondition] = useState('All')
    const [location, setLocation] = useState('All')
    const [maxPrice, setMaxPrice] = useState(50000)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [sortBy, setSortBy] = useState('newest')


    const filtered = LISTINGS.filter((item) => {
        const matchSearch = item.title.toLowerCase().includes(search.toLowerCase())
        const matchCategory = category === 'All' || item.category === category;
        const matchCondition = condition === 'All' || item.condition === condition;
        const matchLoction = location === 'All' || item.location === location;
        const matchPrice = item.price <= maxPrice;
        return matchSearch && matchCategory && matchCondition && matchLoction && matchPrice;

    })
    .sort((a,b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price
        return 0;
    })

    function resetFilters() {
        setCategory('All')
        setCondition('All')
        setLocation('All')
        setMaxPrice(50000)
        setSearch('')
    }

    const activeFilterCount = [
        category !== 'All',
        condition !== 'All',
        location !== 'All',
        maxPrice !== 50000,
    ].filter(Boolean).length


    // shared filter panel (used in sidebar)
    const FilterPanel = () => (
        <div className="flex flex-col gap-7">
            {/* category */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Category</p>
                <div className="flex flex-col gap-1">
                    {CATEGORIES.map((cat) => (
                        <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${category === cat ? "bg-[#1a3d2b] text-white": "text-gray-600 hover:bg-[#f7f3ed]"}`}
                        >
                            {cat}
                        </button>
                    ))}

                </div>
            </div>
            {/* condition    */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Condition</p>
                <div className="flex flex-col gap-1">
                    {CONDITIONS.map((cond) => (
                        <button
                        key={cond}
                        onClick={() => setCondition(cond)}
                        className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${ condition === cond ? "bg-[#1a3d2b] text-white" : "text-gray-600 hover:bg-[#f7f3ed]"}`}
                        >
                            {cond === 'All' ? 'All Conditions' : cond}
                        </button>
                    ))}
                </div>
            </div>
            {/* price range         */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Max Price</p>
                    <span className="text-sm font-bold text-[#1a3d2b]">Ksh {maxPrice.toLocaleString()}</span>
                </div>
                <input 
                type="range"
                min = {0}
                max={50000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#1a3d2b]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Ksh 0</span>
                    <span>Ksh 50,000</span>
                </div>
            </div>
            {/* location */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Location</p>
                <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm bg-white"
                >
                    {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
                    ))}

                </select>
            </div>

            {/* reset */}
            {activeFilterCount > 0 && (
                <button
                onClick={resetFilters}
                className="text-sm text-red-500 hover:text-red-700 font-semibold text-left transition-colors"
                >   
                  ✕ Clear all filters  
                </button>
            )}
        </div>
    );
    return (
        <div className="min-h-screen bg-[#f7f3ed]">
            {/* top nav */}
            <nav className="bg-[#1a3d2b] sticky top-0 z-40 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <Link to='/' className="flex items-center gap-2">
                        <span className="text-[#f5a623] text-xl">⚙</span>
                        <span className="font-extrabold text-lg text-white">YFixIt</span>
                    </Link>

                    {/* search bar-desktop */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                        <div className="relative w-full">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                           <input 
                           type="text"
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           placeholder="Search listings..."
                           className="w-full pl-9 pr-4 py-2 rounded-full bg-white/100 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:bg-white/20 text-sm"
                           /> 
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                        to='/login'
                        className="hidden md:block text-white/80 hover:text-white text-sm font-medium"
                        >
                            Log in
                        </Link>
                        <Link
                        to='/signup?role=seller'
                        className="text-xs sm:text-sm font-bold px-3 py-2 rounded-full bg-[#f5a623] text-[#1a1a1a] hover:bg-amber-500 transition-all"
                        >
                           + List Item 
                        </Link>
                    </div>

                </div>
                {/* mobile search */}
                <div className="md:hidden px-4 pb-3">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                        <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search listings"
                        className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                        />
                    </div>
                </div>
            </nav>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* page header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-extrabold text-[#1a1a1a]">Browse Listings</h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {filtered.length} item{filtered.length !== 1 ? "s": ""} found
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* sort */}
                        <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-sm px-3 py-2 rounded-xl border-2 border-gray-200 bg-white focus:border-[#1a3d2b] focus:outline-none"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price-asc">Price: Low → High</option>
                            <option value="price-desc">Price: High → Low</option>
                        </select>
                        {/* MOBILE FILTER */}
                        <button
                        onClick={() => setDrawerOpen(true)}
                        className="lg:hidden flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl bg-[#1a3d2b] text-white"
                        >
                            ⚙ Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-[#f5a623] text-[#1a1a1a] text-xs font-bold px-1.5 py-0.5 rounded-full">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
                <div className="flex gap-6">
                    {/* sidebar */}
                    <aside className="hidden lg:block w-56 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-20">
                            <p className="font-extrabold text-[#1a1a1a] mb-5">Filters</p>
                            <FilterPanel />
                        </div>

                    </aside>

                    {/* product grid */}
                    <main>
                        
                    </main>
                </div>
            </div>
        </div>
        
    )



}