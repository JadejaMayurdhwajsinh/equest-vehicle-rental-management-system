// src/components/dashboard/DashboardChart.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const DashboardChart = () => {
  const [overview, setOverview] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const API_BASE = 'http://localhost:5000/api/analytics';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchOverview();
    fetchBookings();
    fetchRevenue();
    fetchVehicles();
  }, []);

  // === Fetch functions ===
  const fetchOverview = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/overview`, { headers });
      setOverview(data.data.summary);
    } catch (err) {
      console.error('Error fetching overview:', err.response?.data || err.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/bookings`, { headers });
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err.response?.data || err.message);
    }
  };

  const fetchRevenue = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/revenue`, {
        headers,
        params: { days: 30, group_by: 'day' }
      });
      setRevenue(data.data.analytics || []);
    } catch (err) {
      console.error('Error fetching revenue:', err.response?.data || err.message);
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/vehicles/utilization`, {
        headers,
        params: { days: 30 }
      });
      setVehicles(data.data.vehicles || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err.response?.data || err.message);
    }
  };

  if (!overview) return <p>Loading dashboard...</p>;

  // === Prepare charts ===
  const revenueChart = {
    labels: revenue.map(r => r.period),
    datasets: [{
      label: 'Revenue',
      data: revenue.map(r => parseFloat(r.totalRevenue)),
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  const vehicleChart = {
    labels: vehicles.map(v => v.vehicleNumber),
    datasets: [{
      label: 'Utilization %',
      data: vehicles.map(v => v.utilizationPercentage),
      backgroundColor: 'rgba(255, 159, 64, 0.5)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1
    }]
  };

  const bookingsByStatus = {
    labels: ['Active', 'Completed', 'Cancelled'],
    datasets: [{
      label: 'Bookings',
      data: [
        bookings.filter(b => b.status === 'active').length,
        bookings.filter(b => b.status === 'completed').length,
        bookings.filter(b => b.status === 'cancelled').length
      ],
      backgroundColor: ['#36A2EB', '#4BC0C0', '#FF6384']
    }]
  };

  return (
    <div>
      <h2>Dashboard Overview</h2>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div>Total Vehicles: {overview.totalVehicles}</div>
        <div>Active Rentals: {overview.activeRentals}</div>
        <div>Available Vehicles: {overview.availableVehicles}</div>
        <div>Maintenance Due: {overview.maintenanceDue}</div>
      </div>

      <h3>Revenue (Last 30 Days)</h3>
      <Line data={revenueChart} />

      <h3>Vehicle Utilization</h3>
      <Bar data={vehicleChart} />

      <h3>Bookings by Status</h3>
      <Pie data={bookingsByStatus} />
    </div>
  );
};

export default DashboardChart;
