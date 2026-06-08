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


}