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



}