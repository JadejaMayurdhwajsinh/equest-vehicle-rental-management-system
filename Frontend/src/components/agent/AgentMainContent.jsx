import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const AgentMainContent = () => {
  const { axiosInstance } = useAuth();
  const [dailyOps, setDailyOps] = useState([]);
  const [vehicleStatus, setVehicleStatus] = useState({});
  const [customerRequests, setCustomerRequests] = useState([]);
  const [fleetAnalytics, setFleetAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentData();
  }, []);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      const [opsRes, statusRes, requestsRes, analyticsRes] = await Promise.all([
        axiosInstance.get("/agents/daily-operations"),
        axiosInstance.get("/agents/vehicle-status"),
        axiosInstance.get("/agents/customer-requests"),
        axiosInstance.get("/agents/fleet-analytics"),
      ]);

      setDailyOps(opsRes.data);
      setVehicleStatus(statusRes.data);
      setCustomerRequests(requestsRes.data);
      setFleetAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Failed to fetch agent dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold mb-4">Agent Dashboard</h2>

      {/* Daily Operations */}
      <section className="mb-6">
        <h3 className="text-lg font-medium">Daily Operations</h3>
        <ul className="list-disc pl-6">
          {dailyOps.map((op) => (
            <li key={op.id}>{op.description} - {op.time}</li>
          ))}
        </ul>
      </section>

      {/* Vehicle Status */}
      <section className="mb-6">
        <h3 className="text-lg font-medium">Vehicle Status</h3>
        <p>Available: {vehicleStatus.available}</p>
        <p>Rented: {vehicleStatus.rented}</p>
        <p>Maintenance: {vehicleStatus.maintenance}</p>
      </section>

      {/* Customer Requests */}
      <section className="mb-6">
        <h3 className="text-lg font-medium">Customer Requests</h3>
        <ul className="list-disc pl-6">
          {customerRequests.map((req) => (
            <li key={req.id}>{req.type} - {req.status}</li>
          ))}
        </ul>
      </section>

      {/* Fleet Analytics */}
      <section>
        <h3 className="text-lg font-medium">Fleet Analytics</h3>
        <p>Utilization: {fleetAnalytics.utilization}%</p>
        <p>Total Revenue: ${fleetAnalytics.revenue}</p>
      </section>
    </main>
  );
};

export default AgentMainContent;
