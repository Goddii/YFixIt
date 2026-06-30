import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/useAuth";

const CATEGORIES = ["Phones", "Laptops", "Tablets", "TVs", "Audio", "Appliances", "Other"];
const CONDITIONS = ["Good", "Fair", "Broken"];
const LOCATIONS = ["Nairobi", "Westlands", "Kilimani", "Thika", "Mombasa", "Kisumu", "Eldoret"];
const MAX_IMAGE_SIZE_MB = 5;

const CONDITION_STYLES = {
  Good: "bg-green-100 text-green-700",
  Fair: "bg-yellow-100 text-yellow-700",
  Broken: "bg-red-100 text-red-600",
};

const EMPTY_FORM = {
  title: "",
  category: CATEGORIES[0],
  condition: CONDITIONS[0],
  price: "",
  location: LOCATIONS[0],
  description: "",
};

function formatPostedDate(value) {
  if (!value) return "recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [seller, setSeller]         = useState(null);
  const [listings, setListings]     = useState([]);
  const [activeTab, setActiveTab]   = useState("listings"); // listings | new | stats
  const [form, setForm]             = useState(EMPTY_FORM);
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [formError, setFormError]   = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [deleteId, setDeleteId]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [pageError, setPageError]   = useState("");


  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const [profile, listingsData] = await Promise.all([
          api.me(),
          api.myListings(),
        ]);

        if (!mounted) return;
        setSeller(profile.user);
        setListings(listingsData.listings || []);
      } catch (err) {
        if (mounted) setPageError(err.message || "Could not load seller dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalListings  = listings.length;
  const activeListings = listings.filter((l) => l.status === "active").length;
  const soldListings   = listings.filter((l) => l.status === "sold").length;
  const totalViews     = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const sellerName     = seller?.name || "Seller";
  const sellerAvatar   = sellerName.charAt(0).toUpperCase();

  // ── Form handlers ─────────────────────────────────────────────────────────
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError("");

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setFormError("Please choose a PNG, JPG, or WEBP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setFormError(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const { title, price, description } = form;
    if (!title || !price || !description) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (isNaN(price) || Number(price) <= 0) {
      setFormError("Please enter a valid price.");
      return;
    }

    try {
      let image_url = null;

      if (imageFile) {
        setUploading(true);
        try {
          const uploadResult = await api.uploadImage(imageFile);
          image_url = uploadResult.image_url;
        } catch (err) {
          setFormError(err.message || "Could not upload image.");
          return;
        } finally {
          setUploading(false);
        }
      }

      const data = await api.createListing({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        location: form.location,
        ...(image_url && { image_url }),
      });

      setListings([data.listing, ...listings]);
      setForm(EMPTY_FORM);
      removeImage();
      setFormSuccess(true);
      setActiveTab("listings");
      setTimeout(() => setFormSuccess(false), 4000);
    } catch (err) {
      setFormError(err.message || "Could not post listing.");
    }
  }

  async function markAsSold(id) {
    try {
      const data = await api.updateListing(id, { status: "sold" });
      setListings(listings.map((l) => l.id === id ? data.listing : l));
    } catch (err) {
      setPageError(err.message || "Could not update listing.");
    }
  }

  async function markAsActive(id) {
    try {
      const data = await api.updateListing(id, { status: "active" });
      setListings(listings.map((l) => l.id === id ? data.listing : l));
    } catch (err) {
      setPageError(err.message || "Could not update listing.");
    }
  }

  async function deleteListing(id) {
    try {
      await api.deleteListing(id);
      setListings(listings.filter((l) => l.id !== id));
      setDeleteId(null);
    } catch (err) {
      setPageError(err.message || "Could not delete listing.");
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

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
            <Link to="/browse" className="text-white/70 hover:text-white text-sm font-medium hidden sm:block">
              Browse
            </Link>
            {/* Seller avatar */}
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 cursor-pointer hover:bg-white/20 transition-all">
              <div className="w-6 h-6 rounded-full bg-[#f5a623] flex items-center justify-center text-xs font-bold text-[#1a1a1a]">
                {sellerAvatar}
              </div>
              <span className="text-white text-xs font-medium hidden sm:block">{sellerName}</span>
            </div>
            <button onClick={handleLogout} className="text-white/60 hover:text-white text-xs font-medium transition-colors">
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a]">
              Welcome back, {sellerName.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage your listings and track your sales</p>
          </div>
          <button
            onClick={() => setActiveTab("new")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f5a623] text-[#1a1a1a] font-bold text-sm hover:bg-amber-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 self-start sm:self-auto"
          >
            + Post New Item
            </button>
        </div>

        {pageError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3 mb-6 text-sm font-medium">
            {pageError}
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center mb-8">
            <p className="font-bold text-lg text-[#1a1a1a]">Loading dashboard...</p>
          </div>
        )}

        {/* ── STAT CARDS ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Listings", value: totalListings, icon: "📦", color: "bg-white" },
            { label: "Active",         value: activeListings, icon: "🟢", color: "bg-white" },
            { label: "Sold",           value: soldListings,   icon: "✅", color: "bg-white" },
            { label: "Total Views",    value: totalViews,     icon: "👁️", color: "bg-white" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className={`${color} rounded-2xl shadow-sm p-5`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{icon}</span>
              </div>
              <p className="text-2xl font-extrabold text-[#1a1a1a]">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* ── SUCCESS TOAST ───────────────────────────────────────────────── */}
        {formSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 mb-6 flex items-center gap-2 text-sm font-medium">
            ✅ Listing posted successfully!
          </div>
        )}

        {/* ── TABS ────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white rounded-2xl shadow-sm p-1.5 mb-6 w-fit">
          {[
            { id: "listings", label: "My Listings" },
            { id: "new",      label: "+ New Listing" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-[#1a3d2b] text-white shadow"
                  : "text-gray-400 hover:text-[#1a1a1a]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAB: MY LISTINGS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "listings" && (
          <div className="flex flex-col gap-4">
            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <p className="text-5xl mb-4">📭</p>
                <p className="font-bold text-lg text-[#1a1a1a]">No listings yet</p>
                <p className="text-gray-400 text-sm mt-1">Post your first item to get started</p>
                <button
                  onClick={() => setActiveTab("new")}
                  className="mt-5 px-6 py-3 rounded-xl bg-[#f5a623] text-[#1a1a1a] font-bold text-sm hover:bg-amber-500 transition-all"
                >
                  Post an Item →
                </button>
              </div>
            ) : (
              listings.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row gap-4 transition-all ${
                    item.status === "sold" ? "opacity-60" : ""
                  }`}
                >
                  {/* Image */}
                  <div className="bg-[#f7f3ed] rounded-xl w-full sm:w-24 h-24 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      "Item"
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <h3 className="font-bold text-[#1a1a1a] text-base">{item.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CONDITION_STYLES[item.condition] || "bg-gray-100 text-gray-500"}`}>
                        {item.condition}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === "active"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {item.status === "active" ? "🟢 Active" : "✅ Sold"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      📍 {item.location} · {item.category} · Posted {formatPostedDate(item.created_at)}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-[#f5a623] font-extrabold text-lg">
                        Ksh {Number(item.price || 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">👁 {item.views || 0} views</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <Link
                      to={`/listing/${item.id}`}
                      className="text-xs font-semibold px-3 py-2 rounded-lg bg-[#f7f3ed] text-[#1a3d2b] hover:bg-[#e8f0eb] transition-all text-center"
                    >
                      View
                    </Link>
                    {item.status === "active" ? (
                      <button
                        onClick={() => markAsSold(item.id)}
                        className="text-xs font-semibold px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-all"
                      >
                        Mark Sold
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsActive(item.id)}
                        className="text-xs font-semibold px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                      >
                        Relist
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: NEW LISTING FORM
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "new" && (
          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 max-w-2xl">
            <h2 className="text-xl font-extrabold text-[#1a1a1a] mb-1">Post a New Item</h2>
            <p className="text-gray-400 text-sm mb-7">Fill in the details below — it takes about 2 minutes.</p>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                  Item Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Samsung S21 Cracked Screen"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm transition-colors"
                />
              </div>

              {/* Category + Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Condition</label>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm bg-white"
                  >
                    {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Price + Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                    Price (Ksh) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 2500"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Location</label>
                  <select
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm bg-white"
                  >
                    {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the item — condition, what works, what doesn't, any accessories included…"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm transition-colors resize-none"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                  Item Photo <span className="text-gray-400 font-normal">(optional)</span>
                </label>

                {imagePreview ? (
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center hover:bg-red-600 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#1a3d2b] transition-colors text-gray-400 text-xs font-medium gap-1">
                    <span className="text-2xl">📷</span>
                    Add photo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, or WEBP. Max {MAX_IMAGE_SIZE_MB}MB.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3.5 rounded-xl bg-[#f5a623] text-[#1a1a1a] font-bold text-sm hover:bg-amber-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:-translate-y-0"
                >
                  {uploading ? "Uploading photo…" : "Post Listing →"}
                </button>
                <button
                  type="button"
                  onClick={() => { setForm(EMPTY_FORM); removeImage(); setActiveTab("listings"); }}
                  className="px-5 py-3.5 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold text-sm hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── DELETE CONFIRM MODAL ────────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <p className="text-4xl mb-4">🗑️</p>
            <h3 className="font-extrabold text-xl text-[#1a1a1a] mb-2">Delete listing?</h3>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone. The listing will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteListing(deleteId)}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}