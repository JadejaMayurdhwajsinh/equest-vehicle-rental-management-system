import React, { useEffect, useState } from "react";
import ApiService from "../../Services/api";
import VehicleCard from "../VehicleCard.jsx";
import axios from "axios";

const VehicleSearch = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({ type: "", seats: "", available: true });

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchVehicles = async () => {
    const query = new URLSearchParams(filters).toString();
    const res = await axios.get(`/api/vehicles?${query}`);
    setVehicles(res.data);
  };

  return (
    <div>
      <h2>Vehicle Search</h2>
      <div style={{ marginBottom: "15px" }}>
        <input
          placeholder="Type"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        />
        <input
          placeholder="Seats"
          type="number"
          value={filters.seats}
          onChange={(e) => setFilters({ ...filters, seats: e.target.value })}
        />
        <button onClick={fetchVehicles}>Search</button>
      </div>
      <div className="vehicle-list">
        {vehicles.map((v) => (
          <VehicleCard key={v._id} vehicle={v} />
        ))}
      </div>
    </div>
  );
};

export default VehicleSearch;
