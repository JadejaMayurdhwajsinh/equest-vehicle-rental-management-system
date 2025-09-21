import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const AdminMainContent = () => {
  const { axiosInstance } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    activeRentals: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsResponse = await axiosInstance.get("/admin/stats");
      setStats(statsResponse.data);

      const activityResponse = await axiosInstance.get("/admin/activity");
      setRecentActivity(activityResponse.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} color="blue" icon="fas fa-users" />
        <StatCard title="Total Vehicles" value={stats.totalVehicles} color="green" icon="fas fa-car" />
        <StatCard title="Active Rentals" value={stats.activeRentals} color="yellow" icon="fas fa-key" />
        <StatCard title="Revenue" value={`$${stats.revenue}`} color="red" icon="fas fa-dollar-sign" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <li key={activity.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-600 truncate">{activity.action}</p>
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {activity.time}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="flex items-center text-sm text-gray-500">{activity.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

const StatCard = ({ title, value, color, icon }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg p-5">
    <div className="flex items-center">
      <div className={`flex-shrink-0 bg-${color}-500 rounded-md p-3`}>
        <i className={`${icon} text-white text-xl`}></i>
      </div>
      <div className="ml-5 w-0 flex-1">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="text-lg font-medium text-gray-900">{value}</dd>
      </div>
    </div>
  </div>
);

export default AdminMainContent;
