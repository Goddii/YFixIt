import {useParams, Link} from 'react-router-dom'

// mock data
const LISTINGS = []

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

        </div>
    )

}
