import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

const CONDITION_STYLES = {
  Good: {
    badge: "bg-green-100 text-green-700",
    note: "This item is usable or needs only minor work.",
  },
  Fair: {
    badge: "bg-yellow-100 text-yellow-700",
    note: "This item may need repair or replacement parts.",
  },
  Broken: {
    badge: "bg-red-100 text-red-600",
    note: "This item is best for repair, parts, or refurbishment.",
  },
};

function formatPostedDate(value) {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sellerPhoneLink(phone) {
  if (!phone) return null;
  const normalized = phone.startsWith("0") ? `254${phone.slice(1)}` : phone.replace(/^\+/, "");
  return normalized;
}

function normalizeMpesaPhone(phone) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;

  return digits;
}

function isValidMpesaPhone(phone) {
  return /^254[17]\d{8}$/.test(phone);
}

function ListingImage({ item, size = "large" }) {
  const sizeClass = size === "thumb" ? "h-16 text-xs" : "h-72 sm:h-96 text-sm";

  return (
    <div className={`bg-[#f7f3ed] ${sizeClass} flex items-center justify-center font-bold text-gray-400 overflow-hidden`}>
      {item.image_url ? (
        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
      ) : (
        "Item"
      )}
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadListing() {
      try {
        const data = await api.getListing(id);
        if (!mounted) return;
        setListing(data.listing);
        setRelated(data.related || []);

        if (localStorage.getItem("token")) {
          try {
            const profile = await api.me();
            if (mounted) setCheckoutPhone(profile.user?.phone || "");
          } catch {
            localStorage.removeItem("token");
          }
        }
      } catch (err) {
        if (mounted) setError(err.message || "Listing not found");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadListing();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!orderId || orderStatus === "completed" || orderStatus === "failed") return undefined;

    const intervalId = window.setInterval(async () => {
      try {
        const data = await api.paymentStatus(orderId);
        const status = data.order?.status;

        if (!status) return;
        setOrderStatus(status);

        if (status === "completed") {
          setPaymentMessage("Payment completed. The listing is now marked as sold.");
          window.clearInterval(intervalId);
        }

        if (status === "failed") {
          setPaymentError("Payment was cancelled or failed. You can try again.");
          window.clearInterval(intervalId);
        }
      } catch (err) {
        setPaymentError(err.message || "Could not check payment status.");
        window.clearInterval(intervalId);
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [orderId, orderStatus]);

  async function handleBuyNow() {
    setPaymentError("");
    setPaymentMessage("");

    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    const phone = normalizeMpesaPhone(checkoutPhone);

    if (!phone) {
      setPaymentError("Enter the M-Pesa phone number to receive the STK push.");
      return;
    }

    if (!isValidMpesaPhone(phone)) {
      setPaymentError("Enter a valid Safaricom number, for example 07XXXXXXXX or 2547XXXXXXXX.");
      return;
    }

    try {
      setPaymentLoading(true);
      const data = await api.stkPush({
        listing_id: listing.id,
        phone,
      });

      setOrderId(data.order_id);
      setOrderStatus("pending");
      setPaymentMessage(data.message || "STK Push sent. Complete the payment on your phone.");
    } catch (err) {
      setPaymentError(err.message || "Could not start M-Pesa payment.");
    } finally {
      setPaymentLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ed] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Loading listing...</h1>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#f7f3ed] flex flex-col items-center justify-center gap-4">
        <p className="text-6xl">😕</p>
        <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Listing not found</h1>
        <p className="text-gray-500 text-sm">{error || "It may have been sold or removed"}</p>
        <Link to="/browse" className="mt-2 px-6 py-3 rounded-full bg-[#1a3d2b] text-white font-bold text-sm hover:bg-[#14301f] transition-all">
          ← Back to Browse
        </Link>
      </div>
    );
  }

  const cond = CONDITION_STYLES[listing.condition] || {
    badge: "bg-gray-100 text-gray-500",
    note: "Check the description and contact the seller for details.",
  };
  const postedDate = formatPostedDate(listing.created_at);
  const sellerName = listing.seller_name || "Seller";
  const sellerPhone = sellerPhoneLink(listing.seller_phone);
  const whatsappHref = sellerPhone
    ? `https://wa.me/${sellerPhone}?text=${encodeURIComponent(`Hi, I saw your listing for "${listing.title}" on YFixIt. Is it still available?`)}`
    : null;

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      <nav className="bg-[#1a3d2b] sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-[#f5a623] text-xl">⚙</span>
            <span className="font-extrabold text-lg text-white">YFixIt</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/browse" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              ← Browse
            </Link>
            <Link to="/signup?role=seller" className="text-xs sm:text-sm font-bold px-3 py-2 rounded-full bg-[#f5a623] text-[#1a1a1a] hover:bg-amber-500 transition-all">
              + List Item
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-[#1a3d2b] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/browse" className="hover:text-[#1a3d2b] transition-colors">Browse</Link>
          <span>/</span>
          <span className="text-[#1a1a1a] font-medium">{listing.title}</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <ListingImage item={listing} />
              <div className="flex gap-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`w-16 rounded-xl overflow-hidden cursor-pointer transition-all ${i === 1 ? "ring-2 ring-[#1a3d2b]" : "hover:bg-[#e8f0eb]"}`}>
                    <ListingImage item={listing} size="thumb" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-extrabold text-[#1a1a1a] text-lg mb-3">About this item</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
              <div className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${cond.badge}`}>
                {listing.condition} - {cond.note}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-extrabold text-[#1a1a1a] text-lg mb-4">Item details</h2>
              <div className="grid grid-cols-2 gap-y-3">
                {[
                  { label: "Category", value: listing.category },
                  { label: "Condition", value: listing.condition },
                  { label: "Location", value: listing.location },
                  { label: "Listed", value: postedDate },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-sm font-semibold text-[#1a1a1a] mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20">
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cond.badge}`}>
                  {listing.condition}
                </span>
                <span className="text-xs text-gray-400">{postedDate}</span>
              </div>
              <h1 className="font-extrabold text-[#1a1a1a] text-xl leading-snug mt-3 mb-1">{listing.title}</h1>
              <p className="text-xs text-gray-400 mb-4">
                📍 {listing.location} · {listing.category}
              </p>
              <p className="text-3xl font-extrabold text-[#f5a623] mb-6">
                Ksh {Number(listing.price || 0).toLocaleString()}
              </p>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                    M-Pesa phone number
                  </label>
                  <input
                    type="tel"
                    value={checkoutPhone}
                    onChange={(event) => setCheckoutPhone(event.target.value)}
                    placeholder="07XX XXX XXX"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3d2b] focus:outline-none text-sm transition-colors"
                  />
                </div>

                {paymentError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                    {paymentError}
                  </div>
                )}

                {paymentMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
                    {paymentMessage}
                    {orderStatus === "pending" ? " Waiting for confirmation..." : ""}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={paymentLoading || orderStatus === "pending" || listing.status === "sold"}
                  className="w-full py-3.5 rounded-xl bg-[#f5a623] text-[#1a1a1a] font-bold text-sm hover:bg-amber-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {paymentLoading ? "Sending STK Push..." : `Buy Now - Ksh ${Number(listing.price || 0).toLocaleString()}`}
                </button>

                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 rounded-xl border-2 border-[#1a3d2b] text-[#1a3d2b] font-semibold text-sm text-center hover:bg-[#1a3d2b] hover:text-white transition-all"
                  >
                    💬 Message Seller
                  </a>
                )}
                {sellerPhone && (
                  <a
                    href={`tel:+${sellerPhone}`}
                    className="w-full py-3 rounded-xl bg-[#f7f3ed] text-gray-600 font-semibold text-sm text-center hover:bg-[#e8f0eb] transition-all"
                  >
                    📞 Call Seller
                  </a>
                )}
              </div>

              <div className="mt-5 bg-[#f7f3ed] rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500 leading-relaxed">
                  🔒 <span className="font-semibold">Stay safe:</span> Send money only after verification of item
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Seller
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a3d2b] flex items-center justify-center text-white font-bold text-sm">
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm text-[#1a1a1a]">{sellerName}</p>
                  <p className="text-xs text-gray-400">Member - YFixIt seller</p>
                </div>
              </div>
              <Link to="/browse" className="mt-4 block text-center text-xs font-semibold text-[#1a3d2b] hover:text-[#f5a623] transition-colors">
                View all listings by this seller
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-extrabold text-[#1a1a1a] text-xl mb-5">
              More in {listing.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((rel) => {
                const relCond = CONDITION_STYLES[rel.condition] || { badge: "bg-gray-100 text-gray-500" };

                return (
                  <Link
                    key={rel.id}
                    to={`/listing/${rel.id}`}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden group"
                  >
                    <div className="bg-[#f7f3ed] h-36 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:bg-[#eee8df] transition-colors overflow-hidden">
                      {rel.image_url ? (
                        <img src={rel.image_url} alt={rel.title} className="w-full h-full object-cover" />
                      ) : (
                        "Item"
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold text-sm text-[#1a1a1a] leading-snug">{rel.title}</p>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${relCond.badge}`}>
                          {rel.condition}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">📍 {rel.location}</p>
                      <p className="text-[#f5a623] font-extrabold text-sm">
                        Ksh {Number(rel.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
