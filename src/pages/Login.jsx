import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate


    function handleSubmit(e) {
        e.preventDefault();
        setError('')

        // Basic Validation
        if (!email || !password) {
            setError('Please fill in all fields')
            return;

        }

        // TODO (Replace with real flask api call)
        // now simulating login to redirect home
        console.log('Login attempt: ', {email,password});
        alert('Login comming soon after backend connect');
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-[#f7f3ed] flex items-center justify-center px-4">
           {/* card  */}
           <div className="w-full max-w-md">
            {/* logo */}
            <div className="text-center mb-8">
                <Link to='/' className="inline-flex items-center gap-2">
                    <span className="text-[#f5a623] text-3xl">⚙</span>
                    <span className="font-extrabold text-2xl text-[#1a3d2b]">YFixIt</span>
                </Link>
                <p className="text-gray-500 mt-2 text-sm">Welcone back - Log in to your account</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8">
                <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-6">Log In</h1>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                            Email address
                        </label>
                        <input 
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm transition-colors"
                        />
        
                    </div>
                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-semibold text-[#1a1a1a]">
                                Password
                            </label>
                            <a href="#" className="text-xs text-[#1a3d2b] hover:text-[#f5a623] font-medium transition-colors">
                                Forgot password?
                            </a>
                        </div>
                        <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm transition-colors"
                        />

                    </div>
                    {/* submit */}
                    <button type="submit" className="w-full py-3.5 rounded-xl bg-[#1a3d2b] text-white font-bold text-sm hover:bg-[#14301f] transition-all shadow-md hover:shadow-lg hover:translate-y-0.5 mt-1">
                        Log In
                    </button>
                </form>
                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-gray-200"/>
                    <span className="text-xs text-gray-400 font-medium">or</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                {/* sign up redirect */}
                <p className="text-center text-sm text-gray-500">
                    
                </p>
            </div>
           </div>
        </div>
    )
}

