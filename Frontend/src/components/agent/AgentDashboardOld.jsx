// src/components/agent/AgentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ErrorBoundary from '../ErrorBoundary';

const AgentDashboard = () => {
  const { user, logout, axiosInstance } = useAuth();
  const [activeTab, setActiveTab] = useState('dailyOperations');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  const fetchTabData = async (tab) => {
    try {
      setLoading(true);
      let response;
      switch (tab) {
        case 'dailyOperations':
          response = await axiosInstance.get('/analytics/overview');
          setData(response.data);
          break;
        case 'vehicleManagement':
          response = await axiosInstance.get('/analytics/vehicles');
          setData(response.data);
          break;
        case 'customerService':
          response = await axiosInstance.get('/analytics/bookings');
          setData(response.data);
          break;
        case 'fleetStatus':
          response = await axiosInstance.get('/agent/fleet-status');
          setData(response.data);
          break;
        default:
          setData({});
      }
    } catch (error) {
      console.error(`Failed to fetch ${tab} data:`, error);
      setData({});
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (loading) return <p>Loading {activeTab}...</p>;

    switch (activeTab) {
      case 'dailyOperations':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Today's Pickups & Returns</h2>
            {data.pickups?.length || data.returns?.length ? (
              <ul>
                {data.pickups?.map((p) => (
                  <li key={p.id}>
                    Pickup: {p.vehicle} for {p.customer_name} at {p.time}
                  </li>
                ))}
                {data.returns?.map((r) => (
                  <li key={r.id}>
                    Return: {r.vehicle} from {r.customer_name} at {r.time}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No pickups or returns today.</p>
            )}
          </div>
        );
      case 'vehicleManagement':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Vehicle Management</h2>
            <ul>
              {data.vehicles?.map((v) => (
                <li key={v.id}>
                  {v.name} - {v.status} 
                  <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded">Check-in</button>
                  <button className="ml-2 px-2 py-1 bg-green-500 text-white rounded">Check-out</button>
                </li>
              )) || <p>No assigned vehicles.</p>}
            </ul>
          </div>
        );
      case 'customerService':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Customer Service</h2>
            <ul>
              {data.bookings?.map((b) => (
                <li key={b.id}>
                  Booking: {b.customer_name} - {b.vehicle}
                  <button className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded">Modify</button>
                </li>
              )) || <p>No bookings.</p>}
            </ul>
          </div>
        );
      case 'fleetStatus':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Fleet Status</h2>
            <ul>
              {data.fleet?.map((v) => (
                <li key={v.id}>
                  {v.vehicle_name} - {v.available ? 'Available' : 'Not Available'}
                </li>
              )) || <p>No fleet data available.</p>}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Agent Panel</h2>
          <p className="text-gray-700 mb-6">Welcome, {user?.full_name}</p>
          <nav className="flex flex-col space-y-2">
            <button onClick={() => setActiveTab('dailyOperations')} className={`px-4 py-2 rounded text-left hover:bg-gray-200 ${activeTab==='dailyOperations'?'bg-gray-200 font-semibold':''}`}>Daily Operations</button>
            <button onClick={() => setActiveTab('vehicleManagement')} className={`px-4 py-2 rounded text-left hover:bg-gray-200 ${activeTab==='vehicleManagement'?'bg-gray-200 font-semibold':''}`}>Vehicle Management</button>
            <button onClick={() => setActiveTab('customerService')} className={`px-4 py-2 rounded text-left hover:bg-gray-200 ${activeTab==='customerService'?'bg-gray-200 font-semibold':''}`}>Customer Service</button>
            <button onClick={() => setActiveTab('fleetStatus')} className={`px-4 py-2 rounded text-left hover:bg-gray-200 ${activeTab==='fleetStatus'?'bg-gray-200 font-semibold':''}`}>Fleet Status</button>
            <button onClick={logout} className="mt-4 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">Logout</button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <ErrorBoundary>{renderTabContent()}</ErrorBoundary>
      </main>
    </div>
  );
};

export default AgentDashboard;
