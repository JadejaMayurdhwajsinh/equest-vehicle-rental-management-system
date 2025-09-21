// src/components/agent/CustomerService.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const CustomerService = () => {
  const { axiosInstance } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/analytics/bookings?days=7');
      setBookings(response.data.analytics || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModify = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleSaveModification = async (modifiedData) => {
    try {
      await axiosInstance.put(`/agent/bookings/${selectedBooking.id}`, modifiedData);
      setShowModal(false);
      setSelectedBooking(null);
      // Refresh the bookings list
      fetchBookings();
    } catch (error) {
      console.error('Failed to modify booking:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Customer Service - Booking Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Booking ID</th>
              <th className="py-2 px-4 border-b">Customer</th>
              <th className="py-2 px-4 border-b">Vehicle</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="py-2 px-4 border-b">{booking.id}</td>
                <td className="py-2 px-4 border-b">{booking.customer_name}</td>
                <td className="py-2 px-4 border-b">{booking.vehicle}</td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleModify(booking)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-3 rounded"
                  >
                    Modify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modification Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Modify Booking</h3>
            {/* Add form fields for modification based on your API requirements */}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveModification({})}
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerService;