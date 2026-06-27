const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

// helpers
function getErrorMessage(data) {
    if (typeof data?.details?.errorMessage === "string") {
        return data?.error ? `${data.error}: ${data.details.errorMessage}` : data.details.errorMessage;
    }
    if (typeof data?.details?.ResponseDescription === "string") {
        return data?.error ? `${data.error}: ${data.details.ResponseDescription}` : data.details.ResponseDescription;
    }
    if (typeof data?.hint === "string" && typeof data?.error === "string") return `${data.error}. ${data.hint}`;
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.msg === "string") return data.msg;
    if (typeof data?.hint === "string") return data.hint;
    return "Something went wrong";
}

async function uploadRequest(endpoint, formData) {
    const token = localStorage.getItem("token")

    const res = await fetch(`${BASE_URL}${endpoint}`, {
       method: "POST",
       headers: {
        ...(token && {Authorization: `Bearer ${token}`}),
       },
       body: formData, 
    });

    const data = await res.json()
    if (!res.ok) throw new Error(getErrorMessage(data))
    return data    
}

async function request(endpoint, options={}) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}${endpoint}` , {
      headers: {
        "Content-Type" : "application/json",
        ...(token && {Authorization: `Bearer ${token}`}),
      },
      ...options  
    });

    const data = await res.json();
    if(!res.ok) throw new Error(getErrorMessage(data));
    return data;
}

export const api = {
    register: (body) => request("/api/auth/register", {method: "POST", body: JSON.stringify(body)}),

    login: (body) => request("/api/auth/login", {method: "POST", body: JSON.stringify(body)}),

    me: () => request("/api/auth/me"),

    // listings
    getListings: (params = {}) => request("/api/listings/?" + new URLSearchParams(params)),

    getListing: (id) => request(`/api/listings/${id}`),
    myListings: () => request("/api/listings/seller/me"),
    createListing: (body) => request("/api/listings/",{ method: "POST", body: JSON.stringify(body)}),
    updateListing: (id, body) => request(`/api/listings/${id}`, {method: "PUT", body: JSON.stringify(body)}),
    deleteListing:(id) => request(`/api/listings/${id}`, {method: "DELETE"}),

    //uploads
    uploadImage: (file) => {
        const formData = new FormData()
        formData.append("image", file)
        return uploadRequest("/api/uploads/image", formData);
    },


    // PAYMENTS
    stkPush: (body) => request("/api/payments/stk-push", {method: "POST", body: JSON.stringify(body)}),
    paymentStatus: (id) => request(`/api/payments/status/${id}`),
    myOrders: () => request("/api/payments/my-orders"),





}
