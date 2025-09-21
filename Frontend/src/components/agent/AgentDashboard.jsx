// src/components/agent/AgentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ErrorBoundary from '../ErrorBoundary';
import DailyOperations from './DailyOperations';
import VehicleManagement from './VehicleManagement';
import CustomerService from './CustomerService';
import FleetStatus from './FleetStatus';

const AgentDashboard = () => {
  const { user, logout, axiosInstance } = useAuth();
  const [activeTab, setActiveTab] = useState('dailyOperations');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'dailyOperations', label: 'Daily Operations', icon: 'fa-tasks' },
    { id: 'vehicleManagement', label: 'Vehicle Management', icon: 'fa-car' },
    { id: 'customerService', label: 'Customer Service', icon: 'fa-headset' },
    { id: 'fleetStatus', label: 'Fleet Status', icon: 'fa-clipboard-list' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dailyOperations':
        return <DailyOperations />;
      case 'vehicleManagement':
        return <VehicleManagement />;
      case 'customerService':
        return <CustomerService />;
      case 'fleetStatus':
        return <FleetStatus />;
      default:
        return <DailyOperations />;
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
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded text-left hover:bg-gray-200 flex items-center ${
                  activeTab === tab.id ? 'bg-gray-200 font-semibold' : ''
                }`}
              >
                <i className={`fas ${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
            <button
              onClick={logout}
              className="mt-4 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 flex items-center"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <ErrorBoundary>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h1>
            {renderTabContent()}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default AgentDashboard;