import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const ShowVehicles = () => {
  const { axiosInstance } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all vehicles
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/vehicles");
      setVehicles(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
      setError("Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Search filter
  const filteredVehicles = vehicles.filter((vehicle) =>
    [vehicle.vehicle_number, vehicle.make, vehicle.model, vehicle.location]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Delete vehicle
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await axiosInstance.delete(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      alert("Failed to delete vehicle.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-xl font-semibold mb-4">Vehicles List</h2>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by number, make, model, or location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {loading && <p>Loading vehicles...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Vehicles Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Number</th>
              <th className="border p-2">Make</th>
              <th className="border p-2">Model</th>
              <th className="border p-2">Year</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Fuel</th>
              <th className="border p-2">Seats</th>
              <th className="border p-2">Rate</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((v) => (
                <tr key={v._id}>
                  <td className="border p-2">{v.vehicle_number}</td>
                  <td className="border p-2">{v.make}</td>
                  <td className="border p-2">{v.model}</td>
                  <td className="border p-2">{v.year}</td>
                  <td className="border p-2">{v.category_id?.name || "N/A"}</td>
                  <td className="border p-2">{v.fuel_type}</td>
                  <td className="border p-2">{v.seating_capacity}</td>
                  <td className="border p-2">₹{v.daily_rate}</td>
                  <td className="border p-2">{v.location}</td>
                  <td className="border p-2 capitalize">{v.status}</td>
                  <td className="border p-2 space-x-2">
                    <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center p-4 text-gray-500">
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShowVehicles;
