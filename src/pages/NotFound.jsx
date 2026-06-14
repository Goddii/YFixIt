import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7f3ed] flex flex-col items-center justify-center px-4 text-center">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-12">
        <span className="text-[#f5a623] text-3xl">⚙</span>
        <span className="font-extrabold text-2xl text-[#1a3d2b]">YFixIt</span>
      </Link>

      <p className="text-8xl font-extrabold text-[#1a3d2b] opacity-10 leading-none mb-2">404</p>
      <p className="text-5xl mb-6">🔧</p>
      <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-2">Page not found</h1>
      <p className="text-gray-500 text-sm max-w-xs mb-8">
        This page doesn't exist or was removed. Let's get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-[#1a3d2b] text-white font-bold text-sm hover:bg-[#14301f] transition-all shadow-md"
        >
          ← Back to Home
        </Link>
        <Link
          to="/browse"
          className="px-6 py-3 rounded-full bg-[#f5a623] text-[#1a1a1a] font-bold text-sm hover:bg-amber-500 transition-all shadow-md"
        >
          Browse Listings
        </Link>
      </div>
    </div>
  );
}