import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const CreateVehicleCategory = () => {
  const { axiosInstance } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_daily_rate: "",
  });
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/vehiclesCategory");
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axiosInstance.post("/vehiclesCategory", formData);
      setSuccess("Vehicle category created successfully!");
      setFormData({ name: "", description: "", base_daily_rate: "" });
      fetchCategories(); // refresh list
    } catch (err) {
      console.error(err);
      if (err.response) {
        setError(err.response.data.message || "Failed to create category.");
      } else {
        setError("Network error. Please try again.");
      }
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-xl font-semibold mb-4">Create Vehicle Category</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3 mb-6">
        <input
          type="text"
          name="name"
          placeholder="Category Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        />

        <input
          type="number"
          name="base_daily_rate"
          placeholder="Base Daily Rate"
          value={formData.base_daily_rate}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
          className="border p-2 rounded w-full"
        />

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Category
        </button>
      </form>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Categories List */}
      <h3 className="text-lg font-semibold mb-3">All Categories</h3>
      {filteredCategories.length === 0 ? (
        <p className="text-gray-500">No categories found.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Base Daily Rate</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((cat) => (
              <tr key={cat._id}>
                <td className="px-4 py-2 border">{cat.name}</td>
                <td className="px-4 py-2 border">{cat.description}</td>
                <td className="px-4 py-2 border">₹{cat.base_daily_rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CreateVehicleCategory;
