import {useParams, Link} from 'react-router-dom'
import { api } from "../api"
import { useEffect, useState } from 'react'




export default function ListingDetail() {
    const { id } = useParams()
    const [listing, setListing] = useState(null)
    const item = LISTINGS.find((l) => l.id === Number(id))


    useEffect(() => {
        api.getListing(id).then(setListing).catch(console.error)
    }, [id])
    

    // 404 state
    if (!listing) {
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
    const related = LISTINGS.filter((l) => l.category === item.category && l.id !== item.id).slice(0, 3)
    
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
                        <div className='bg-white rounded-3xl shadow-sm p-6 '>
                            <h2 className='font-extrabold text-[#1a1a1a] text-lg mb-4'>Item details</h2>
                            <div className='grid grid-cols-2 gap-y-3'>
                                {[
                                    { label: "Category", value: item.category },
                                    { label: "Condition", value: item.condition },
                                    { label: "Location", value: item.location },
                                    { label: "Listed", value: item.posted },
                                ].map(({label, value}) => (
                                    <div key={label}>
                                        <p className='text-xs text-gray-400 font-medium'> {label}</p>
                                        <p className='text-sm font-semibold text-[#1a1a1a] mt-0.5'> {value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* right price + contact */}
                    <div className='lg:col-span-2 flex flex-col gap-5'>
                        {/* price card */}
                        <div className='bg-white rounded-2xl shadow-sm p-6 sticky top-20'>
                            <div className='flex items-start justify-between mb-2'>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cond.badge}`}>
                                    {item.condition}
                                </span>
                                <span className='text-xs text-gray-400'>
                                    {item.posted}
                                </span>
                            </div>
                            <h1 className='font-extrabold text-[#1a1a1a] text-xl leading-snug mt-3 mb-1'>{item.title}</h1>
                            <p className='text-xs text-gray-400 mb-4'>
                                📍 {item.location} · {item.category}
                            </p>
                            <p className='text-3xl font-extrabold text-[#f5a623] mb-6'>
                                ksh {item.price.toLocaleString()}
                            </p>

                            {/* cta buttons */}
                            <div className='flex flex-col gap-3'>
                                {/* buy now - triggers api for payment */}
                                <button className='w-full py-3.5 rounded-xl bg-[#f5a623] text-[#1a1a1a] font-bold text-sm hover:bg-amber-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5'>
                                    Buy Now - Ksh {item.price.toLocaleString()}
                                </button>

                                {/* message seller day20 this open's chat */}
                                <a href={`https://wa.me/254${item.phone.slice(1)}?text=Hi, I saw your listing for "${item.title}" on YFixIt. Is it still available?`}
                                target='_blank'
                                rel='noreferrer'
                                className='w-full py-3.5 rounded-xl border-2 border-[#1a3d2b] hover:text-white transition-all'
                                >
                                    💬 Message Seller 
                                </a>
                                {/* call */}
                                <a href={`tel:+254{item.phone.slice(1)}`}
                                className='w-full py-3 rounded-xl bg-[#f7f3ed] text-gray-600 font-semibold text-sm text-center hover:bg-[#e8f0eb] transition-all'
                                >
                                     📞 Call Seller
                                </a>
                            </div>
                            {/* safety tip */}
                            <div className='mt-5 bg-[#f7f3ed] rounded-xl px-4 py-3'>
                                <p className='text-xs text-gray-500 leading-relaxed'>
                                   🔒 <span className='font-semibold'> Stay safe: </span> Send money only after verification of item 
                                </p>
                            </div>
                        </div>
                        {/* seller card */}
                        <div className='bg-white rounded-3xl shadow-sm p-5'>
                            <p className='text-xs font-bold uppercase tracking widest text-gray-400 mb-3'>
                                Seller
                            </p>
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 rounded-full bg-[#1a3d2b] flex items-center justify-center text-white font-bold text-sm'>
                                    {item.seller.charAt(0)}
                                </div>
                                <div>
                                    <p className='font-bold text-sm text-[#1a1a1a]'> {item.seller}</p>
                                    <p className='text-xs text-gray-400'>Member -YFixIt seller</p>
                                </div>
                            </div>
                            <Link to='/browse' className='mt-4 block text-center text-xs font-semibold text-[#1a3d2b] hover:text-[#f5a623] transition-colors'>
                                View all listings by this seller
                            </Link>
                        </div>
                    </div>
                </div>
                {/* related listings */}
                {related.length > 0 && (
                    <div className='mt-12'>
                        <h2 className='font-extrabold text-[#1a1a1a] text-xl mb-5'>
                            More in {item.category}
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
                            {related.map((rel) => (
                                <Link key={rel.id}
                                to={`/listing/${rel.id}`}
                                className='bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden group'
                                >
                                    <div className='bg-[#f7f3ed] h-36 flex items-center justify-center text-5xl group-hover:bg-[#eee8df] transition-colors'>
                                        {rel.image}
                                    </div>
                                    <div className='p-4'>
                                        <div className='flex items-start justify-between gap-2 mb-1'>
                                            <p className='font-bold text-sm text-[#1a1a1a] leading-snug'> {rel.title}</p>
                                            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${CONDITION_STYLES[rel.condition].badge}`}>
                                                {rel.condition}
                                            </span>
                                        </div>
                                        <p className='text-xs text-gray-400 mb-2'>📍 {rel.location} </p>
                                        <p className='text-[#f5a623] font-extrabold text-sm'>
                                            ksh {rel.price.toLocaleString()}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    )

}
