import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/useAuth";

const CONDITION_STYLES = {
  Good:   "bg-green-100 text-green-700",
  Fair:   "bg-yellow-100 text-yellow-700",
  Broken: "bg-red-100 text-red-600",
};

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-700",
  pending:   "bg-yellow-100 text-yellow-700",
  failed:    "bg-red-100 text-red-600",
};

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("listings");
  const [buyer, setBuyer] = useState(null);
  const [listings, setListings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const profile = await api.me();
        const currentUser = profile.user;

        if (currentUser.role === "seller") {
          navigate("/seller/dashboard", { replace: true });
          return;
        }

        const [ordersData, listingsData] = await Promise.all([
          api.myOrders(),
          api.getListings(),
        ]);

        if (!mounted) return;
        setBuyer(currentUser);
        setPurchases(ordersData.orders || []);
        setListings(listingsData.listings || []);
        setMessages([]);
      } catch (err) {
        if (mounted) setError(err.message || "Could not load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const buyerName = buyer?.name || "Buyer";
  const buyerAvatar = buyerName.charAt(0).toUpperCase();
  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <div className="min-h-screen bg-[#f7f3ed]">

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav className="bg-[#1a3d2b] sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-[#f5a623] text-xl">⚙</span>
            <span className="font-extrabold text-lg text-white">YFixIt</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/browse" className="text-white/70 hover:text-white text-sm font-medium hidden sm:block transition-colors">
              Browse
            </Link>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-[#f5a623] flex items-center justify-center text-xs font-bold text-[#1a1a1a]">
                {buyerAvatar}
              </div>
              <span className="text-white text-xs font-medium hidden sm:block">{buyerName}</span>
            </div>
            <button onClick={handleLogout} className="text-white/60 hover:text-white text-xs font-medium transition-colors">
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a]">
              Hey, {buyerName.split(" ")[0]}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Track your saved items, purchases and messages</p>
          </div>
          <Link
            to="/browse"
            className="px-5 py-3 rounded-xl bg-[#1a3d2b] text-white font-bold text-sm hover:bg-[#14301f] transition-all shadow-md self-start sm:self-auto"
          >
            Browse Items
          </Link>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center mb-8">
            <p className="font-bold text-lg text-[#1a1a1a]">Loading dashboard...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3 mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* ── STAT CARDS ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Available Items",  value: listings.length },
            { label: "Purchases",    value: purchases.length },
            { label: "New Messages", value: unreadCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-3xl font-extrabold text-[#1a3d2b]">{value}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* ── TABS ──────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white rounded-2xl shadow-sm p-1.5 mb-6 w-fit">
          {[
            { id: "listings",  label: `Available (${listings.length})` },
            { id: "purchases", label: "Purchases" },
            { id: "messages",  label: unreadCount > 0 ? `Messages · ${unreadCount} new` : "Messages" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-[#1a3d2b] text-white shadow"
                  : "text-gray-400 hover:text-[#1a1a1a]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── AVAILABLE ITEMS ───────────────────────────────────────────── */}
        {activeTab === "listings" && (
          <div>
            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <p className="font-bold text-lg text-[#1a1a1a]">No available items</p>
                <p className="text-gray-400 text-sm mt-1">New listings will appear here when sellers post them</p>
                <Link
                  to="/browse"
                  className="mt-5 inline-block px-6 py-3 rounded-xl bg-[#1a3d2b] text-white font-bold text-sm hover:bg-[#14301f] transition-all"
                >
                  Browse Items
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  >
                    {/* Image area */}
                    <div className="bg-[#f7f3ed] h-40 flex items-center justify-center text-4xl group-hover:bg-[#eee8df] transition-colors relative overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span>Item</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold text-sm text-[#1a1a1a] leading-snug">{item.title}</p>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${CONDITION_STYLES[item.condition]}`}>
                          {item.condition}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">
                        {item.location} · by {item.seller_name || "Seller"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#f5a623] font-extrabold">
                          Ksh {item.price.toLocaleString()}
                        </span>
                        <Link
                          to={`/listing/${item.id}`}
                          className="text-xs font-bold text-[#1a3d2b] hover:text-[#f5a623] transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PURCHASES ─────────────────────────────────────────────────── */}
        {activeTab === "purchases" && (
          <div className="flex flex-col gap-4">
            {purchases.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <p className="font-bold text-lg text-[#1a1a1a]">No purchases yet</p>
                <p className="text-gray-400 text-sm mt-1">Items you buy will appear here</p>
              </div>
            ) : (
              purchases.map((purchase) => (
                <div key={purchase.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
                  <div className="bg-[#f7f3ed] rounded-xl w-16 h-16 flex items-center justify-center text-3xl shrink-0">
                    #
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1a1a1a]">Listing #{purchase.listing_id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Ordered {new Date(purchase.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-[#f5a623] font-extrabold mt-1 text-sm">
                      Ksh {purchase.amount.toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${STATUS_STYLES[purchase.status] || "bg-gray-100 text-gray-500"}`}>
                    {purchase.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── MESSAGES ──────────────────────────────────────────────────── */}
        {activeTab === "messages" && (
          <div className="flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <p className="font-bold text-lg text-[#1a1a1a]">No messages yet</p>
                <p className="text-gray-400 text-sm mt-1">Seller conversations will appear here once messaging is connected</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all ${
                    msg.unread ? "border-l-4 border-[#f5a623]" : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-[#1a3d2b] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {msg.seller.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-sm text-[#1a1a1a]">{msg.seller}</p>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">Re: {msg.item}</p>
                    <p className={`text-sm mt-0.5 truncate ${msg.unread ? "font-semibold text-[#1a1a1a]" : "text-gray-500"}`}>
                      {msg.last}
                    </p>
                  </div>

                  {msg.unread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f5a623] shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
