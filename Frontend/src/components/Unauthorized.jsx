import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded text-center">
      <h2 className="text-xl text-red-500 mb-4">Access Denied</h2>
      <p>You don't have permission to access this page.</p>
      <Link to="/" className="text-blue-500 mt-4 inline-block">
        Return to Home
      </Link>
    </div>
  );
};

export default Unauthorized;