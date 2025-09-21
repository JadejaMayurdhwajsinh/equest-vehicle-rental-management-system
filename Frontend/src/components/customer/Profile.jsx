import React, { useState, useEffect } from "react";

const Profile = ({ profileData, onUpdate }) => {
  const [profile, setProfile] = useState({
    address: "",
    date_of_birth: "",
    driving_license_number: "",
    license_expiry_date: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (profileData) setProfile(profileData);
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      if (onUpdate) {
        onUpdate(profile);
        setSuccessMsg("Profile updated successfully!");
      }
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-lg">
      <h2 className="text-2xl font-semibold mb-4">My Profile</h2>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-800 rounded">{error}</div>}
      {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-800 rounded">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={profile.address || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={profile.date_of_birth || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Driving License Number</label>
          <input
            type="text"
            name="driving_license_number"
            value={profile.driving_license_number || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">License Expiry Date</label>
          <input
            type="date"
            name="license_expiry_date"
            value={profile.license_expiry_date || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Emergency Contact Name</label>
          <input
            type="text"
            name="emergency_contact_name"
            value={profile.emergency_contact_name || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Emergency Contact Phone</label>
          <input
            type="text"
            name="emergency_contact_phone"
            value={profile.emergency_contact_phone || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
