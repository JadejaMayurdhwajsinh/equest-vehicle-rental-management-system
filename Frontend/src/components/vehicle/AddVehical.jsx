import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const CreateVehicle = () => {
  const { axiosInstance } = useAuth();

  const [formData, setFormData] = useState({
    vehicle_number: "",
    make: "",
    model: "",
    year: "",
    category_id: "",
    fuel_type: "",
    seating_capacity: "",
    daily_rate: "",
    current_mileage: "",
    last_service_mileage: "",
    status: "available",
    location: "",
    registration_date: "",
    insurance_expiry: "",
  });

  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null); // <-- for update

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/vehiclesCategory");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  // Fetch vehicles
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
    fetchCategories();
    fetchVehicles();
  }, []);

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingVehicle) {
        // Update existing vehicle
        await axiosInstance.put(`/vehicles/${editingVehicle.id}`, formData);
        setSuccess("Vehicle updated successfully!");
      } else {
        // Create new vehicle
        await axiosInstance.post("/vehicles", formData);
        setSuccess("Vehicle added successfully!");
      }

      // Reset form & refresh list
      setFormData({
        vehicle_number: "",
        make: "",
        model: "",
        year: "",
        category_id: "",
        fuel_type: "",
        seating_capacity: "",
        daily_rate: "",
        current_mileage: "",
        last_service_mileage: "",
        status: "available",
        location: "",
        registration_date: "",
        insurance_expiry: "",
      });
      setEditingVehicle(null);
      setShowForm(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      if (err.response) {
        setError(err.response.data.message || "Failed to save vehicle.");
      } else {
        setError("Network error. Please try again.");
      }
    }
  };

  // Handle edit
  const handleEdit = (vehicle) => {
    setFormData({
      vehicle_number: vehicle.vehicle_number,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      category_id: vehicle.category_id?._id || vehicle.category_id || "",
      fuel_type: vehicle.fuel_type,
      seating_capacity: vehicle.seating_capacity,
      daily_rate: vehicle.daily_rate,
      current_mileage: vehicle.current_mileage,
      last_service_mileage: vehicle.last_service_mileage,
      status: vehicle.status,
      location: vehicle.location,
      registration_date: vehicle.registration_date?.substring(0, 10) || "",
      insurance_expiry: vehicle.insurance_expiry?.substring(0, 10) || "",
    });
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await axiosInstance.delete(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      alert("Failed to delete vehicle.");
    }
  };

  // Search
  const filteredVehicles = vehicles.filter((vehicle) =>
    [vehicle.vehicle_number, vehicle.make, vehicle.model, vehicle.location]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="max-w-4xl mx-auto mt-10 p-6 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-4">Vehicle Management</h2>

        {/* Toggle form */}
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingVehicle(null); // reset editing when adding new
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-4"
        >
          {showForm ? "Cancel" : "Add Vehicle"}
        </button>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Inputs (same as before) */}
            <input
              type="text"
              name="vehicle_number"
              placeholder="Vehicle Number"
              value={formData.vehicle_number}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <input
              type="text"
              name="make"
              placeholder="Make"
              value={formData.make}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <input
              type="text"
              name="model"
              placeholder="Model"
              value={formData.model}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <input
              type="number"
              name="year"
              placeholder="Year"
              value={formData.year}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              name="fuel_type"
              value={formData.fuel_type}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            >
              <option value="">Select Fuel Type</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>

            <input
              type="number"
              name="seating_capacity"
              placeholder="Seating Capacity"
              value={formData.seating_capacity}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <input
              type="number"
              name="daily_rate"
              placeholder="Daily Rate"
              value={formData.daily_rate}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <input
              type="number"
              name="current_mileage"
              placeholder="Current Mileage"
              value={formData.current_mileage}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              type="number"
              name="last_service_mileage"
              placeholder="Last Service Mileage"
              value={formData.last_service_mileage}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="in_service">In Service</option>
            </select>

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <input
              type="date"
              name="registration_date"
              value={formData.registration_date}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <input
              type="date"
              name="insurance_expiry"
              value={formData.insurance_expiry}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <div className="col-span-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
              >
                {editingVehicle ? "Update Vehicle" : "Save Vehicle"}
              </button>
            </div>
          </form>
        )}

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </div>

      {/* Vehicle List */}
      <div className="max-w-6xl mx-auto mt-10 p-6 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-4">Vehicles List</h2>

        <input
          type="text"
          placeholder="Search by number, make, model, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />

        {loading && <p>Loading vehicles...</p>}
        {error && <p className="text-red-500">{error}</p>}

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
                  <tr key={v.id}>
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
                      <button
                        onClick={() => handleEdit(v)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
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
    </>
  );
};

export default CreateVehicle;
