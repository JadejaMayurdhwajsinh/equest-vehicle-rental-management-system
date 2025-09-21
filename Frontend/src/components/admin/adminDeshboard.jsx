// // src/components/AdminDashboard.js
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { Link } from 'react-router-dom';

// const AdminDashboard = () => {
//   const { user, logout, axiosInstance } = useAuth();
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalVehicles: 0,
//     activeRentals: 0,
//     revenue: 0
//   });
//   const [recentActivity, setRecentActivity] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const statsResponse = await axiosInstance.get('/admin/stats');
//       setStats(statsResponse.data);

//       const activityResponse = await axiosInstance.get('/admin/activity');
//       setRecentActivity(activityResponse.data);
//     } catch (error) {
//       console.error('Failed to fetch dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex bg-gray-100">
//       {/* Sidebar */}
//       <aside className="w-100 bg-white shadow-md flex flex-col">
//         <div className="p-6">
//           <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
//           <p className="text-gray-700 mb-6">Welcome, {user?.full_name}</p>
//           <nav className="flex flex-col space-y-2">
//             <Link to="/admin-dashboard" className="px-4 py-2 rounded hover:bg-gray-200">Dashboard</Link>
//             <Link to="/admin-users" className="px-4 py-2 rounded hover:bg-gray-200">Users</Link>
//             <Link to="/admin-vehicles" className="px-4 py-2 rounded hover:bg-gray-200">Vehicles</Link>
//             <Link to="/admin-rentals" className="px-4 py-2 rounded hover:bg-gray-200">Rentals</Link>
//             <Link to="/admin-reports" className="px-4 py-2 rounded hover:bg-gray-200">Reports</Link>
//             <button
//               onClick={logout}
//               className="mt-4 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
//             >
//               Logout
//             </button>
//           </nav>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-8 ">
//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
//           <div className="bg-white overflow-hidden shadow rounded-lg p-5">
//             <div className="flex items-center">
//               <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
//                 <i className="fas fa-users text-white text-xl"></i>
//               </div>
//               <div className="ml-5 w-0 flex-1">
//                 <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
//                 <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white overflow-hidden shadow rounded-lg p-5">
//             <div className="flex items-center">
//               <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
//                 <i className="fas fa-car text-white text-xl"></i>
//               </div>
//               <div className="ml-5 w-0 flex-1">
//                 <dt className="text-sm font-medium text-gray-500 truncate">Total Vehicles</dt>
//                 <dd className="text-lg font-medium text-gray-900">{stats.totalVehicles}</dd>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white overflow-hidden shadow rounded-lg p-5">
//             <div className="flex items-center">
//               <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
//                 <i className="fas fa-key text-white text-xl"></i>
//               </div>
//               <div className="ml-5 w-0 flex-1">
//                 <dt className="text-sm font-medium text-gray-500 truncate">Active Rentals</dt>
//                 <dd className="text-lg font-medium text-gray-900">{stats.activeRentals}</dd>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white overflow-hidden shadow rounded-lg p-5">
//             <div className="flex items-center">
//               <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
//                 <i className="fas fa-dollar-sign text-white text-xl"></i>
//               </div>
//               <div className="ml-5 w-0 flex-1">
//                 <dt className="text-sm font-medium text-gray-500 truncate">Revenue</dt>
//                 <dd className="text-lg font-medium text-gray-900">${stats.revenue}</dd>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recent Activity */}
//         <div className="bg-white shadow overflow-hidden sm:rounded-md">
//           <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
//             <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
//           </div>
//           <ul className="divide-y divide-gray-200">
//             {recentActivity.map((activity) => (
//               <li key={activity.id}>
//                 <div className="px-4 py-4 sm:px-6">
//                   <div className="flex items-center justify-between">
//                     <p className="text-sm font-medium text-blue-600 truncate">{activity.action}</p>
//                     <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{activity.time}</p>
//                   </div>
//                   <div className="mt-2">
//                     <p className="flex items-center text-sm text-gray-500">{activity.description}</p>
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminDashboard;
// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminMainContent from './DashboardStats'; // your current stats + recent activity component
import CreateVehicleCategory from '../vehicle/AddVehicleCategory';
import ActiveRentals from '../vehicle/ActiveRental';
import Vehicles from  '../vehicle/Vehicals'
import UserManagement from '../User/UserManagement';
import ErrorBoundary from '../ErrorBoundary';ActiveRentals
// import Vehicles from './Vehicles';
// import Rentals from './Rentals';
// import Reports from './Reports';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminMainContent />;
      case 'users':
        return (
          <ErrorBoundary>
            <UserManagement />
          </ErrorBoundary>
        );
      case 'vehicalCategory':
        return <CreateVehicleCategory />;
      case 'vehicles':
        return <Vehicles />;
      case 'rentals':
        return <ActiveRentals />;
      case 'reports':
        return <Reports />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
          <p className="text-gray-700 mb-6">Welcome, {user?.full_name}</p>
          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded text-left hover:bg-gray-200 ${
                activeTab === 'dashboard' ? 'bg-gray-200 font-semibold' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded text-left hover:bg-gray-200 ${
                activeTab === 'users' ? 'bg-gray-200 font-semibold' : ''
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-4 py-2 rounded text-left hover:bg-gray-200 ${
                activeTab === 'vehicles' ? 'bg-gray-200 font-semibold' : ''
              }`}
            >
              Vehicles
            </button>
            <button
              onClick={() => setActiveTab('rentals')}
              className={`px-4 py-2 rounded text-left hover:bg-gray-200 ${
                activeTab === 'rentals' ? 'bg-gray-200 font-semibold' : ''
              }`}
            >
              Rentals
            </button>
         

            <button
              onClick={() => setActiveTab('vehicalCategory')}
              className={`px-4 py-2 rounded text-left hover:bg-gray-200 ${
                activeTab === 'vehicalCategory' ? 'bg-gray-200 font-semibold' : ''
              }`}
            >
              vehicalCategory
            </button>
            <button
              onClick={logout}
              className="mt-4 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default AdminDashboard;
