// src/components/analytics/ActiveRentals.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const ActiveRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActiveRentals = async () => {
      try {
        const token = localStorage.getItem("token"); // adjust if using cookies
        const res = await axios.get("/api/analytics/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRentals(res.data.bookings || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch rentals");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveRentals();
  }, []);

  if (loading) return <p className="text-gray-600">Loading active rentals...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Active Rentals</h2>
      <p className="mb-4 text-gray-700">Total: {rentals.length}</p>

      {rentals.length === 0 ? (
        <p className="text-gray-500">No active rentals found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Vehicle</th>
              <th className="border p-2">Customer</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr key={rental.id} className="text-center">
                <td className="border p-2">
                  {rental.Vehicle?.vehicleNumber || "N/A"}
                </td>
                <td className="border p-2">
                  {rental.Customer?.name} <br />
                  <span className="text-gray-500 text-xs">
                    {rental.Customer?.email}
                  </span>
                </td>
                <td className="border p-2 text-green-600 font-semibold">
                  {rental.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ActiveRentals;