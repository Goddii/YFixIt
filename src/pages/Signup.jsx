import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/useAuth"



export default function Signup() {
    const [searchParams] = useSearchParams();

    //select role if coming from hero buttons
    const [role, setRole] = useState(searchParams.get("role") || "buyer");

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('')
    const navigate = useNavigate();
    const { register } = useAuth()

    function handleChange(e) {
        setForm({...form, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match")
            return
        }
        try {
            await register ({ ...form, role})
            navigate(role === "seller" ? "/seller/dashboard": "/buyer/dashboard")
        } catch (err) {
            setError(err.message || "Something went wrong")
        }
    };

    return(
        <div className="min-h-screen bg-[#f7f3ed] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* logo */}
                <div className="text-center mb-8">
                    <Link to='/' className="inline-flex items-center gap-2">
                        <span className="text-[#f5a623] text-3xl">⚙</span>
                        <span className="font-extrabold text-2xl text-[#1a32d2b]">YFixIt</span>

                    </Link>
                    <p className="text-gray-500 mt-2 text-sm ">Create your free acount</p>
                </div>
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-2">Get Started</h1>
                    <p className="text-gray-400 text-sm mb-6">Choose how you want to use YFixIt</p>
                    {/* role toggle */}
                    <div className="bg-[#f7f3ed] rounded-2xl p-1.5 flex gap-1.5 mb-7">
                        {[
                            {value: 'buyer', icon: '🛍️', label: 'I want to buy'},
                            {value: 'seller', icon: '📦', label: 'I want to sell'},
                        ].map(({value,icon,label}) => (
                            <button key={value}
                            type="button"
                            onClick={() => setRole(value)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${role === value ? 'bg-[#1a3d2b] text-white shadow-md' : 'text-gray-400 hover:text-[#1a1a1a]'}`}

                            >
                              <span> {icon}</span>
                              {label}  
                            </button>
                        ))}
                    </div>
                    {/* role context hint */}
                    <div className={`rounded-xl px-4 py-3 text-xs           font-medium mb-6 ${role === 'seller' ? 'bg-[#1a3d2b]/10 text-[#1a3d2b]' : 'bg-[#f5a623]/15 text-[#b57d10]'}`}>
                        {role === "seller"
                        ? "📦 As a seller you can post items,set prices, and receive payments via mpesa or bank"
                        : "🛍️ As a buyer you can browse listings, message sellers, and pay securely via mpesa or bank"
                        }
                    </div>
                    {/* error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* full name */}
                        <div>
                            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Full Name</label>
                            <input 
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Jane Wanjiku"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm transition-colors"
                            />

                        </div>
                        {/* email */}
                        <div>
                            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Email Address</label>
                            <input 
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm transition-colors"
                            />
                        </div>

                        {/* phone */}
                        <div>
                          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Phone Number</label>
                          <div className="flex">
                            <span className="px-3 py-3 bg-[#f7f3ed] border-2 border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 font-medium">
                               🇰🇪 +254 
                            </span>
                            <input 
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="7XX XXX XXX"
                            className="flex-1 px-4 py-3 rounded-r-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm transition-colors"
                            />
                          </div>
                          {/* password */}
                          <div>
                            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Password</label>
                            <input 
                            type="password"
                            name="password"
                            value={form.password}
                            placeholder="Min. 6 characters"
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm transition-colors"
                            />
                          </div>

                          {/* confirm password */}
                          <div>
                            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Confirm Password</label>
                            <input 
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#a3d2b] focus:outline-none text-sm transition-colors"
                            />
                          </div>
                          {/* terms   */}
                          <p className="text-xs text-gray-400 text-center mt-1">
                            By signing up you agree to our {' '}
                            <a href="#" className="text-[#1a3d2b] font-semibold hover:text-[#f5a623]">Terms of Service</a>
                            {' '} and {' '}
                            <a href="#" className="text-[#1a3d2b] font-semibold hover:text-[#f5a623]">Privacy Policy</a>
                          </p>
                          {/* submit */}
                          <button 
                          type="submit"
                          className="w-full py-3.5 rounded-xl bg-[#f5a623] text-[#1a1a1a] mt-2 font-bold text-sm hover:bg-amber-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                          >
                            Create {role === 'seller' ? 'Seller' : 'Buyer'} Account →
                          </button>
                        </div>
                    </form>
                    {/* login redirect */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to='/login' className="text-[#1a3d2b] font-bold hover:text-[#f5a623] transition-colors">
                        Log in
                        </Link>
                    </p>
                </div>
                {/* back home */}
                <p className="text-center mt-5">
                    <Link to='/' className="text-xs text-gray-400 hover:text-[#1a3d2b] transition-colors">
                         ← Back to homepage
                    </Link>
                </p>

            </div>
        </div>
    )



}
