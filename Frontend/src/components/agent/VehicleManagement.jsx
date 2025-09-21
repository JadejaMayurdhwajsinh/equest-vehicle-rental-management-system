// src/components/agent/VehicleManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const VehicleManagement = () => {
  const { axiosInstance } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/analytics/vehicles/utilization?days=30');
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (vehicleId) => {
    try {
      await axiosInstance.post(`/agent/vehicles/${vehicleId}/checkin`);
      // Refresh the vehicle list
      fetchVehicles();
    } catch (error) {
      console.error('Failed to check in vehicle:', error);
    }
  };

  const handleCheckOut = async (vehicleId) => {
    try {
      await axiosInstance.post(`/agent/vehicles/${vehicleId}/checkout`);
      // Refresh the vehicle list
      fetchVehicles();
    } catch (error) {
      console.error('Failed to check out vehicle:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Vehicle Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Vehicle</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Utilization</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.vehicleId}>
                <td className="py-2 px-4 border-b">
                  {vehicle.make} {vehicle.model} ({vehicle.vehicleNumber})
                </td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      vehicle.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : vehicle.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">
                  {vehicle.utilizationPercentage}%
                </td>
                <td className="py-2 px-4 border-b">
                  {vehicle.status === 'available' ? (
                    <button
                      onClick={() => handleCheckOut(vehicle.vehicleId)}
                      className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded mr-2"
                    >
                      Check Out
                    </button>
                  ) : vehicle.status === 'rented' ? (
                    <button
                      onClick={() => handleCheckIn(vehicle.vehicleId)}
                      className="bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded"
                    >
                      Check In
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleManagement;   