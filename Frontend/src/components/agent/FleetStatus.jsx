// src/components/agent/FleetStatus.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const FleetStatus = () => {
  const { axiosInstance } = useAuth();
  const [fleetStats, setFleetStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    maintenanceVehicles: 0,
    outOfService: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFleetStats();
  }, []);

  const fetchFleetStats = async () => {
    try {
      setLoading(true);

      // Fetch all vehicles
      const vehiclesResponse = await axiosInstance.get("/vehicles");
      const vehicles = vehiclesResponse.data;

      // Count by status
      const totalVehicles = vehicles.length;
      const availableVehicles = vehicles.filter(v => v.status === "available").length;
      const maintenanceVehicles = vehicles.filter(v => v.status === "maintenance").length;
      const outOfService = vehicles.filter(v => v.status === "out_of_service").length;

      setFleetStats({
        totalVehicles,
        availableVehicles,
        maintenanceVehicles,
        outOfService,
      });
    } catch (error) {
      console.error("Failed to fetch fleet stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const utilizationPercentage =
    fleetStats.totalVehicles > 0
      ? Math.round(
          ((fleetStats.totalVehicles -
            fleetStats.availableVehicles -
            fleetStats.maintenanceVehicles -
            fleetStats.outOfService) /
            fleetStats.totalVehicles) *
            100
        )
      : 0;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Fleet Status Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Vehicles" value={fleetStats.totalVehicles} color="blue" />
        <StatCard title="Available" value={fleetStats.availableVehicles} color="green" />
        <StatCard title="Maintenance" value={fleetStats.maintenanceVehicles} color="yellow" />
        <StatCard title="Out of Service" value={fleetStats.outOfService} color="red" />
      </div>

      {/* Utilization */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Fleet Utilization</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full"
            style={{ width: `${utilizationPercentage}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-gray-600">{utilizationPercentage}% Utilization Rate</p>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className={`bg-${color}-100 p-4 rounded-lg`}>
    <h3 className={`text-lg font-semibold text-${color}-800`}>{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default FleetStatus;
