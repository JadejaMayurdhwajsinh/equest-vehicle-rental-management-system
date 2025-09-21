// import React, { useState } from "react";
// import VehicleSearch from "./vehicleSearch.jsx";
// import MyBookings from "./myBookings.jsx";
// import Profile from "./profile.jsx";
// import PaymentHistory from "./paymentHistory.jsx";

// const CustomerDashboard = () => {
//   const [activeTab, setActiveTab] = useState("vehicleSearch");

//   return (
//     <div>
//       <h1>Customer Dashboard</h1>
//       <nav style={{ marginBottom: "20px" }}>
//         <button onClick={() => setActiveTab("vehicleSearch")}>Vehicle Search</button>
//         <button onClick={() => setActiveTab("myBookings")}>My Bookings</button>
//         <button onClick={() => setActiveTab("profile")}>Profile</button>
//         <button onClick={() => setActiveTab("payments")}>Payment History</button>
//       </nav>

//       <div>
//         {activeTab === "vehicleSearch" && <VehicleSearch />}
//         {activeTab === "myBookings" && <MyBookings />}
//         {activeTab === "profile" && <Profile />}
//         {activeTab === "payments" && <PaymentHistory />}
//       </div>
//     </div>
//   );
// };

// export default CustomerDashboard;
// src/components/customer/CustomerDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import BookingModal from "./BookingModal";
import VehicleCard from "../VehicleCard.jsx";
import BookingCard from "./BookingCard.jsx";
import Profile from "./Profile.jsx";

const BASE_URL = "http://localhost:5000/api"; // Change to your backend URL

const CustomerDashboard = () => {
    const { user } = useAuth();
    const userId = user?.id;
    const token = localStorage.getItem("token");

    const [activeTab, setActiveTab] = useState("bookings");
    const [bookings, setBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [profile, setProfile] = useState({});
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const [searchFilters, setSearchFilters] = useState({
        category: "",
        pickupDate: "",
        returnDate: "",
        location: "",
    });

    const [loading, setLoading] = useState({
        bookings: false,
        vehicles: false,
        profile: false,
        payments: false,
    });

    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    useEffect(() => {
        // console.log("HERE", userId);
        if (!userId) return;


        const fetchData = async () => {
            try {
                setError(null);
                setSuccessMsg(null);

                if (activeTab === "bookings") {
                    setLoading((s) => ({ ...s, bookings: true }));
                    const res = await axios.get(`${BASE_URL}/bookings/customer/${userId}`, axiosConfig);

                    // console.log(res);

                    setBookings(res.data.bookings || res.data || []);
                    setLoading((s) => ({ ...s, bookings: false }));
                }

                if (activeTab === "vehicles") {
                    setLoading((s) => ({ ...s, vehicles: true }));
                    const res = await axios.get(`${BASE_URL}/vehicles?available=true`, axiosConfig);
                    setVehicles(res.data || []);
                    setFilteredVehicles(res.data || []);
                    setLoading((s) => ({ ...s, vehicles: false }));
                }

                if (activeTab === "profile") {
                    setLoading((s) => ({ ...s, profile: true }));
                    const res = await axios.get(`${BASE_URL}/auth/profileInfo`, axiosConfig);
                    console.log(res);
                    
                    setProfile(res.data.user || res.data || {});
                    setLoading((s) => ({ ...s, profile: false }));
                }

                if (activeTab === "payments") {
                    setLoading((s) => ({ ...s, payments: true }));
                    const res = await axios.get(`${BASE_URL}/payments/my`, axiosConfig);
                    setPaymentHistory(res.data.payments || res.data || []);
                    setLoading((s) => ({ ...s, payments: false }));
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Failed to fetch data");
                setLoading({ bookings: false, vehicles: false, profile: false, payments: false });
            }
        };

        fetchData();
    }, [activeTab, userId, token]);

    const handleSearch = async (e) => {
        e?.preventDefault();
        try {
            setLoading((s) => ({ ...s, vehicles: true }));

            const params = {};
            if (searchFilters.category) params.category = searchFilters.category;
            if (searchFilters.pickupDate) params.pickupDate = searchFilters.pickupDate;
            if (searchFilters.returnDate) params.returnDate = searchFilters.returnDate;
            if (searchFilters.location) params.location = searchFilters.location;

            const res = await axios.get(`${BASE_URL}/vehicles`, { headers: axiosConfig.headers, params });
            setFilteredVehicles(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to search vehicles");
        } finally {
            setLoading((s) => ({ ...s, vehicles: false }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters((s) => ({ ...s, [name]: value }));
    };

    const handleBookVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowBookingModal(true);
    };

    const handleConfirmBooking = async (bookingData) => {
        if (!userId) {
            setError("User not authenticated. At Handle Booking.");
            return;
        }
        // console.log("Booking Data:", bookingData);


        try {
            setError(null);
            const payload = {
                customer_id: userId,
                vehicle_id: bookingData.vehicle._id || bookingData.vehicle.id,
                pickup_date: bookingData.pickupDate,
                return_date: bookingData.returnDate,
                pickup_location: bookingData.pickupLocation,
                return_location: bookingData.returnLocation,
                payment_method: bookingData.paymentMethod || "card",
                total_amount: bookingData.total || 0,
            };
            // console.log("Token : ", token);

            const res = await axios.post(`${BASE_URL}/bookings`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // console.log("Res:", res);

            if (res.data?.booking || res.status === 201) {
                setSuccessMsg("Booking created successfully.");
                const bookingsRes = await axios.get(`${BASE_URL}/bookings/my`, axiosConfig);
                setBookings(bookingsRes.data.bookings || bookingsRes.data || []);
                setShowBookingModal(false);
                setActiveTab("bookings");
            } else {
                setError("Unexpected response from server.");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to create booking");
        }
        setShowBookingModal(false);
    };

    const handleProfileUpdate = async (updatedProfile) => {
        try {
            setLoading((s) => ({ ...s, profile: true }));
            setError(null);
            const res = await axios.put(`${BASE_URL}/customers/${userId}`, updatedProfile, axiosConfig);
            console.log(res);
            
            setProfile(res.data.user || res.data || {});
            setSuccessMsg("Profile updated successfully.");
        } catch (err) {
            setError(err.response?.data || "Failed to update profile");
        } finally {
            setLoading((s) => ({ ...s, profile: false }));
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            setError(null);
            console.log("Way To Cancel Booking ");
            
            const res = await axios.delete(`${BASE_URL}/bookings/${bookingId}/cancel`, axiosConfig);

            console.log(res);
            
            if (res.data?.booking) {
                setSuccessMsg("Booking cancelled.");
                const bookingsRes = await axios.get(`${BASE_URL}/bookings/my`, axiosConfig);
                setBookings(bookingsRes.data.bookings || bookingsRes.data || []);
            } else {
                setError("Failed to cancel booking.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to cancel booking.");
        }
    };

    const statusPill = (status) => {
        const base = "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full";
        switch (status) {
            case "completed":
                return <span className={`${base} bg-gray-200 text-gray-800`}>Completed</span>;
            case "confirmed":
            case "upcoming":
                return <span className={`${base} bg-green-100 text-green-800`}>Upcoming</span>;
            case "cancelled":
                return <span className={`${base} bg-red-100 text-red-800`}>Cancelled</span>;
            case "active":
                return <span className={`${base} bg-blue-100 text-blue-800`}>Active</span>;
            default:
                return <span className={`${base} bg-yellow-100 text-yellow-800`}>Unknown</span>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Alerts */}
            {error && (
                <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800">{error}</div>
            )}
            {successMsg && (
                <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-800">{successMsg}</div>
            )}

            <div className="grid grid-cols-12 gap-6">
                {/* Sidebar */}
                <aside className="col-span-12 md:col-span-3">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-lg font-semibold mb-4 text-slate-800">Customer Portal</h3>
                        <nav className="flex flex-col space-y-2">
                            {["bookings", "vehicles", "profile", "payments"].map((tab) => (
                                <button
                                    key={tab}
                                    className={`text-left px-3 py-2 rounded ${activeTab === tab ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"
                                        }`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === "bookings" ? "My Bookings" :
                                        tab === "vehicles" ? "Vehicle Search" :
                                            tab === "profile" ? "Profile Management" :
                                                "Payment History"}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main content */}
                <main className="col-span-12 md:col-span-9">
                    {activeTab === "bookings" && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4 text-slate-800">My Bookings</h2>
                            {loading.bookings ? (
                                <p>Loading bookings...</p>
                            ) : bookings.length === 0 ? (
                                <p>No bookings found.</p>
                            ) : (
                                bookings.map((b) => (
                                    <BookingCard key={b.id} booking={b} onCancel={handleCancelBooking}/>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "vehicles" && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4 text-slate-800">Book Vehicle</h2>
                            <div>
                                {vehicles.length === 0 ? (
                                    <p>No vehicles available.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredVehicles.map((v) => (
                                            <VehicleCard key={v._id} vehicle={v} onBook={handleBookVehicle} />
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                    {activeTab === "profile" && (
                        <Profile profileData={profile} onUpdate={handleProfileUpdate} />
                    )}
                    {activeTab === "payments" && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4 text-slate-800">My Payment History</h2>
                        </div>
                    )}

                    {/* Bookings / Vehicles / Profile / Payments content here (same as previous Tailwind version) */}
                    {/* For brevity, content sections remain the same */}
                </main>
            </div>

            {/* Booking modal */}
            <BookingModal
                show={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                vehicle={selectedVehicle}
                onConfirm={handleConfirmBooking}
            />
        </div>
    );
};

export default CustomerDashboard;
