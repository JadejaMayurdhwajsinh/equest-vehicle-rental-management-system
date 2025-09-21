import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardChart from "./DashboardChart";
const AdminMainContent = () => {
  const { axiosInstance } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const usersResponse = await axiosInstance.get("/customers");
      const totalUsers = usersResponse.data.customers.length;

      // Fetch total vehicles
      const vehiclesResponse = await axiosInstance.get("/vehicles");
      const totalVehicles = vehiclesResponse.data.length;

      // Fetch active rentals, revenue, and maintenance due from backend overview
      // const overviewResponse = await axiosInstance.get("/admin/overview?period=today");
      // const overviewData = overviewResponse.data.data;

      // const activeRentals = overviewData.summary.activeRentals;
      // const revenue = overviewData.revenue.periodRevenue || 0;
      // const maintenanceDue = overviewData.summary.maintenanceDue;

      setStats({ totalUsers, totalVehicles});

      // Optional: fetch recent activity
      // const activityResponse = await axiosInstance.get("/admin/activity");
      // setRecentActivity(activityResponse.data);

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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} color="blue" icon="fas fa-users" />
        <StatCard title="Total Vehicles" value={stats.totalVehicles} color="green" icon="fas fa-car" />
       
      </div>

      {/* Recent Activity */}
    <DashboardChart/>
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
