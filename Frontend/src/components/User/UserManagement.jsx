import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const UserManagement = () => {
  const { axiosInstance } = useAuth();
  const [userType, setUserType] = useState("customer"); // customer or agent
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch users based on type
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = userType === "customer" ? "/customers" : "/agents";
      const res = await axiosInstance.get(endpoint);

      // Backend may return customers/agents array inside data
      const dataArray =
        userType === "customer"
          ? res?.data?.customers || []
          : res?.data?.agents || [];

      setUsers(Array.isArray(dataArray) ? dataArray : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(`Failed to load ${userType}s.`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userType]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Edit user
  const handleEdit = (user) => {
    setEditingUser(user);

    if (userType === "customer") {
      setFormData({
        address: user.address || "",
        date_of_birth: user.date_of_birth || "",
        driving_license_number: user.driving_license_number || "",
        emergency_contact_name: user.emergency_contact_name || "",
        emergency_contact_phone: user.emergency_contact_phone || "",
      });
    } else if (userType === "agent") {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "agent",
      });
    }
  };

  // Update user
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser?.id) return;

    try {
      const endpoint =
        userType === "customer"
          ? `/customers/${editingUser.id}`
          : `/agents/${editingUser.id}`;

      await axiosInstance.put(endpoint, formData);
      setSuccess(`${userType.charAt(0).toUpperCase() + userType.slice(1)} updated successfully!`);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user:", err);
      setError(`Failed to update ${userType}.`);
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!id || !window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const endpoint = userType === "customer" ? `/customers/${id}` : `/agents/${id}`;
      await axiosInstance.delete(endpoint);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(`Failed to delete ${userType}.`);
    }
  };

  // Filter users
  const filteredUsers = (Array.isArray(users) ? users : []).filter((u) => {
    if (userType === "customer") {
      return [u.address, u.driving_license_number, u.date_of_birth]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    } else {
      return [u.name, u.email, u.role].join(" ").toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>

      {/* User Type Selector */}
      <div className="flex items-center space-x-4 mb-4">
        <label className="font-medium">Select User Type:</label>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="customer">Customer</option>
          <option value="agent">Agent</option>
        </select>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={`Search ${userType}s...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {loading && <p>Loading {userType}s...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              {userType === "customer" ? (
                <>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Address</th>
                  <th className="border p-2">DOB</th>
                  <th className="border p-2">License No</th>
                  <th className="border p-2">Emergency Contact</th>
                  <th className="border p-2">Actions</th>
                </>
              ) : (
                <>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Role</th>
                  <th className="border p-2">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  {userType === "customer" ? (
                    <>
                      <td className="border p-2">{u.user_id || "-"}</td>
                      <td className="border p-2">{u.address || "-"}</td>
                      <td className="border p-2">{u.date_of_birth || "-"}</td>
                      <td className="border p-2">{u.driving_license_number || "-"}</td>
                      <td className="border p-2">
                        {u.emergency_contact_name || "-"} ({u.emergency_contact_phone || "-"})
                      </td>
                      <td className="border p-2 space-x-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border p-2">{u.full_name || "-"}</td>
                      <td className="border p-2">{u?.User?.email || "-"}</td>
                      <td className="border p-2 capitalize">{u.role || "agent"}</td>
                      <td className="border p-2 space-x-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={userType === "customer" ? 6 : 4} className="text-center p-4 text-gray-500">
                  No {userType}s found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Form */}
      {editingUser && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Edit {userType}</h3>
          <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
            {userType === "customer" ? (
              <>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <input
                  type="date"
                  name="date_of_birth"
                  placeholder="Date of Birth"
                  value={formData.date_of_birth || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="driving_license_number"
                  placeholder="License Number"
                  value={formData.driving_license_number || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="emergency_contact_name"
                  placeholder="Emergency Contact Name"
                  value={formData.emergency_contact_name || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="emergency_contact_phone"
                  placeholder="Emergency Contact Phone"
                  value={formData.emergency_contact_phone || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <select
                  name="role"
                  value={formData.role || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                >
                  <option value="">Select Role</option>
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </>
            )}
            <div className="col-span-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
              >
                Update {userType}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
