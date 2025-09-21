// // src/components/auth/RegisterForm.jsx
// import React, { useState } from "react";
// import axios from "axios";
// import { useAuth } from "../../context/AuthContext";

// const RegisterForm = () => {
//   const { setUser } = useAuth(); // optional, if you want to set user after register
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     full_name: "",
//     phone: "",
//     user_type: "customer",
//     // Customer fields
//     date_of_birth: "",
//     address: "",
//     driving_license_number: "",
//     license_expiry_date: "",
//     emergency_contact_name: "",
//     emergency_contact_phone: "",
//     // Agent fields
//     employee_id: "",
//     branch_location: "",
//     role: "agent",
//     hire_date: "",
//     commission_rate: 0,
//   });
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/auth/register",
//         formData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       console.log(response);
//       setSuccess("Registration successful! You can now login.");
//       // optionally set user immediately
//       if (response.data.user) setUser(response.data.user);
//     } catch (err) {
//       console.error(err);
//       if (err.response || err.response.data) {
//         setError(
//           err.response.data.message ||
//           (err.response.data.details
//             ? err.response.data.details.join(", ")
//             : "Registration failed")
//         );
//       } else {
//         setError("Registration failed. Please try again.");
//       }
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="max-w-md mx-auto mt-10 p-6 border rounded"
//     >
//       <h2 className="text-xl mb-4">Register</h2>
//       {error && <p className="text-red-500 mb-2">{error}</p>}
//       {success && <p className="text-green-500 mb-2">{success}</p>}

//       <select
//         name="user_type"
//         value={formData.user_type}
//         onChange={handleChange}
//         className="border p-2 w-full mb-3"
//       ><option value="">Select User Type</option>
//         <option value="customer">Customer</option>
//         <option value="agent">Agent</option>
//       </select>

//       <input
//         type="text"
//         name="full_name"
//         placeholder="Full Name"
//         value={formData.full_name}
//         onChange={handleChange}
//         required
//         className="border p-2 w-full mb-3"
//       />
//       <input
//         type="email"
//         name="email"
//         placeholder="Email"
//         value={formData.email}
//         onChange={handleChange}
//         required
//         className="border p-2 w-full mb-3"
//       />
//       <input
//         type="password"
//         name="password"
//         placeholder="Password"
//         value={formData.password}
//         onChange={handleChange}
//         required
//         className="border p-2 w-full mb-3"
//       />
//       <input
//         type="text"
//         name="phone"
//         placeholder="Phone"
//         value={formData.phone}
//         onChange={handleChange}
//         required
//         className="border p-2 w-full mb-3"
//       />

//       {formData.user_type === "customer" && (
//         <>
//           <input
//             type="date"
//             name="date_of_birth"
//             placeholder="Date of Birth"
//             value={formData.date_of_birth}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full mb-3"
//           />
//           <input
//             type="text"
//             name="address"
//             placeholder="Address"
//             value={formData.address}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full mb-3"
//           />
//           <input
//             type="text"
//             name="driving_license_number"
//             placeholder="Driving License Number"
//             value={formData.driving_license_number}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full mb-3"
//           />
//           <input
//             type="date"
//             name="license_expiry_date"
//             placeholder="License Expiry Date"
//             value={formData.license_expiry_date}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full mb-3"
//           />
//           <input
//             type="text"
//             name="emergency_contact_name"
//             placeholder="Emergency Contact Name"
//             value={formData.emergency_contact_name}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full mb-3"
//           />
//           <input
//             type="text"
//             name="emergency_contact_phone"
//             placeholder="Emergency Contact Phone"
//             value={formData.emergency_contact_phone}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full mb-3"
//           />
//         </>
//       )}

//       {formData.user_type === "agent" && (
//         <>
//           <input
//             type="text"
//             name="employee_id"
//             placeholder="Employee ID"
//             value={formData.employee_id}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full mb-3"
//           />
//           <input
//             type="text"
//             name="branch_location"
//             placeholder="Branch Location"
//             value={formData.branch_location}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full mb-3"
//           />
//           <select
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className="border p-2 w-full mb-3"
//           >
//             <option value="manager">Manager</option>
//             <option value="supervisor">Supervisor</option>
//             <option value="agent">Agent</option>
//             <option value="senior_agent">Senior Agent</option>
//           </select>
//           <input
//             type="date"
//             name="hire_date"
//             placeholder="Hire Date"
//             value={formData.hire_date}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full mb-3"
//           />
//           <input
//             type="number"
//             name="commission_rate"
//             placeholder="Commission Rate (%)"
//             value={formData.commission_rate}
//             onChange={handleChange}
//             min="0"
//             max="50"
//             className="border p-2 w-full mb-3"
//           />
//         </>
//       )}

//       <button
//         type="submit"
//         className="bg-green-500 text-white px-4 py-2 rounded"
//       >
//         Register
//       </button>
//     </form>
//   );
// };

// export default RegisterForm;


// src/components/auth/RegisterForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    user_type: "customer",
    // Customer fields
    date_of_birth: "",
    address: "",
    driving_license_number: "",
    license_expiry_date: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    // Agent fields
    employee_id: "",
    branch_location: "",
    role: "agent",
    hire_date: "",
    commission_rate: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccess("Registration successful! You can now login.");
      if (response.data.user) setUser(response.data.user);

      // Optional: redirect to login after registration
      navigate("/login");
    } catch (err) {
      console.error(err);
      if (err.response || err.response.data) {
        setError(
          err.response.data.message ||
            (err.response.data.details
              ? err.response.data.details.join(", ")
              : "Registration failed")
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 p-6 border rounded"
    >
      <h2 className="text-xl mb-4">Register</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <select
        name="user_type"
        value={formData.user_type}
        onChange={handleChange}
        className="border p-2 w-full mb-3"
      >
        <option value="">Select User Type</option>
        <option value="customer">Customer</option>
        <option value="agent">Agent</option>
        <option value="admin">Admin</option> {/* added Admin */}
      </select>

      {/* Common fields */}
      <input
        type="text"
        name="full_name"
        placeholder="Full Name"
        value={formData.full_name}
        onChange={handleChange}
        required
        className="border p-2 w-full mb-3"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="border p-2 w-full mb-3"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        className="border p-2 w-full mb-3"
      />
 <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-3"
          />
      {/* Customer fields */}
      {formData.user_type === "customer" && (
        <>
         
          <input
            type="date"
            name="date_of_birth"
            placeholder="Date of Birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-3"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-3"
          />
          <input
            type="text"
            name="driving_license_number"
            placeholder="Driving License Number"
            value={formData.driving_license_number}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-3"
          />
          <input
            type="date"
            name="license_expiry_date"
            placeholder="License Expiry Date"
            value={formData.license_expiry_date}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-3"
          />
          <input
            type="text"
            name="emergency_contact_name"
            placeholder="Emergency Contact Name"
            value={formData.emergency_contact_name}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-3"
          />
          <input
            type="text"
            name="emergency_contact_phone"
            placeholder="Emergency Contact Phone"
            value={formData.emergency_contact_phone}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-3"
          />
        </>
      )}

      {/* Agent fields */}
      {formData.user_type === "agent" && (
        <>
          <input
            type="text"
            name="employee_id"
            placeholder="Employee ID"
            value={formData.employee_id}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-3"
          />
          <input
            type="text"
            name="branch_location"
            placeholder="Branch Location"
            value={formData.branch_location}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-3"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="border p-2 w-full mb-3"
          >
            <option value="manager">Manager</option>
            <option value="supervisor">Supervisor</option>
            <option value="agent">Agent</option>
            <option value="senior_agent">Senior Agent</option>
          </select>
          <input
            type="date"
            name="hire_date"
            placeholder="Hire Date"
            value={formData.hire_date}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-3"
          />
          <input
            type="number"
            name="commission_rate"
            placeholder="Commission Rate (%)"
            value={formData.commission_rate}
            onChange={handleChange}
            min="0"
            max="50"
            className="border p-2 w-full mb-3"
          />
        </>
      )}

      {/* Admin fields: only full_name, email, password */}
      {formData.user_type === "admin" && (
        <p className="text-gray-500 mb-3">
          Admin only requires Full Name, Email, and Password.
        </p>
      )}

      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        Register
      </button>

      <p className="mt-4 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500 underline">
          Login here
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
