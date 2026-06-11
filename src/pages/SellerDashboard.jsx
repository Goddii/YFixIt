import { useState } from "react";
import { Link } from "react-router-dom";

// Mock seller data
const SELLER = {
  name: "Wanjiku M.",
  email: "wanjiku@example.com",
  phone: "0712345678",
  joined: "June 2026",
  avatar: "W",
};

const INITIAL_LISTINGS = [
  { id: 1, title: "Samsung S21 Cracked Screen", category: "Phones", condition: "Broken", price: 2500, location: "Nairobi CBD", image: "📱", status: "active", views: 34, posted: "2h ago" },
  { id: 2, title: "Dell Laptop Charger 65W", category: "Laptops", condition: "Good", price: 800, location: "Westlands", image: "🔌", status: "active", views: 12, posted: "5h ago" },
  { id: 3, title: "Broken Nikon D3200", category: "Cameras", condition: "Broken", price: 4500, location: "Nairobi CBD", image: "📷", status: "sold", views: 89, posted: "3d ago" },
];

const CONDITION_STYLES = {
  Good:   "bg-green-100 text-green-700",
  Fair:   "bg-yellow-100 text-yellow-700",
  Broken: "bg-red-100 text-red-600",
};

const CATEGORIES = ["Phones", "Laptops", "Audio", "Monitors", "Gaming", "Cameras", "Accessories", "Other"];
const CONDITIONS = ["Good", "Fair", "Broken"];
const LOCATIONS  = ["Nairobi CBD", "Westlands", "Thika Town", "Kilimani", "Kasarani", "Mombasa Rd", "Upperhill", "Karen", "Parklands"];

const EMPTY_FORM = {
  title: "", category: "Phones", condition: "Good",
  price: "", location: "Nairobi CBD", description: "", image: "📱",
};

const IMAGE_OPTIONS = ["📱","💻","🔌","🎧","🖥️","🎮","📷","⌨️","🔊","🖱️","🔋","🖨️","📺","⌚","🕹️"];


export default function SellerDashboard() {
    const [listings, setListings] = useState(INITIAL_LISTINGS);
    const [form, setForm] = useState(EMPTY_FORM);
    const [activeTab, setActiveTab] = useState("listings");
    const [formErrors, setFormErrors] = useState('');
    const [formSuccess, setFormSuccess] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // handle status change (active/sold)
    const totalListings  = listings.length;
    const activeListings = listings.filter((l) => l.status === "active").length;
    const soldListings   = listings.filter((l) => l.status === "sold").length;
    const totalViews     = listings.reduce((sum, l) => sum + l.views, 0);

    //form handlers
    function handleChange(e){
        setForm({...form, [e.target.name]:e.target.value})
    }

    function handleSubmit(e){
        // Handle form submission logic here
        e.preventDefault();
        setFormErrors('');
        const {title, price, description} = form;
        if(!title || !price || !description){
            setFormErrors('Please fill in all required fields');
            return;
        }

        if (isNaN(price) || Number(price) <= 0){
            setFormErrors('Price must be a positive number');
            return;
        }
        const newListing = {
            id: Date.now(),
            ...form,
            price: Number(form.price),
            status: "active",
            views: 0,
            posted: "Just now",
        };
        setListings([newListing, ...listings]);
        setForm(EMPTY_FORM);
        setFormSuccess(true);
        setActiveTab("listings");
        setTimeout(() => setFormSuccess(false), 4000);
        
    }
    function markAsSold(id){
        setListings(listings.map((l) => l.id === id ? {...l,status:'sold'} : l));
    }

    function markAsActive(id){
        setListings(listings.map((l) => l.id === id ? {...l,status:'active'} : l));
    }

    function deleteListing(id){
        setListings(listings.filter((l) => l.id !== id));
        setDeleteId(null);
    }

    return (
        <div className='min-h-screen bg-[#f7f3ed]'>
            {/* navbar */}
            <nav className="bg-[#1a3d2b] sticky top-0 z-40 shadow-md">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-[#f5a623] text-xl">⚙</span>
                        <span className="font-extrabold text-lg text-white">YFixIt</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link to="/browse" className="text-white/70 hover:text-white text-sm font-medium hidden sm:block">
                        Browse
                        </Link>
                        {/* seller avatar */}
                        <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 cursor-pointer hover:bg-white/20 transition-all">
                            <div className="w-6 h-6 rounded-full bg-[#f5a623] flex items-center justify-center text-xs font-bold text-[#1a1a1a]">
                                {SELLER.avatar}
                            </div>
                            <span className="text-white text-xs font-medium">{SELLER.name}</span>
                        
                        </div>
                        <Link to='/' className="text-white/60 hover:text-white text-xs font-medium transition-colors">
                        Logout
                        </Link>
                    </div>
                </div>

            </nav>



        </div>
    )




}