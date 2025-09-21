// src/components/agent/DailyOperations.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const DailyOperations = () => {
  const { axiosInstance } = useAuth();
  const [todayOperations, setTodayOperations] = useState({ pickups: [], returns: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayOperations();
  }, []);

  const fetchTodayOperations = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/analytics/bookings');
      // Process the data to extract today's pickups and returns
      // This would depend on your actual API response structure
      const today = new Date().toISOString().split('T')[0];
      console.log(today);
      
      const todayData = response.data.analytics.find(item => item.period === today) || {};
      console.log(todayData);
      
      // This is a placeholder - you'll need to adjust based on your API response
      setTodayOperations({
        pickups: todayData.pickups || [],
        returns: todayData.returns || []
      });
    } catch (error) {
      console.error('Failed to fetch today operations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Pickups */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-car text-blue-500 mr-2"></i>
            Today's Pickups
          </h3>
          {todayOperations.pickups.length > 0 ? (
            <ul className="space-y-3">
              {todayOperations.pickups.map((pickup) => (
                <li key={pickup.id} className="bg-white p-3 rounded shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{pickup.vehicle}</h4>
                      <p className="text-sm text-gray-600">Customer: {pickup.customer_name}</p>
                      <p className="text-sm text-gray-600">Time: {pickup.time}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Pickup
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No pickups scheduled for today.</p>
          )}
        </div>

        {/* Today's Returns */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-undo text-green-500 mr-2"></i>
            Today's Returns
          </h3>
          {todayOperations.returns.length > 0 ? (
            <ul className="space-y-3">
              {todayOperations.returns.map((returnItem) => (
                <li key={returnItem.id} className="bg-white p-3 rounded shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{returnItem.vehicle}</h4>
                      <p className="text-sm text-gray-600">Customer: {returnItem.customer_name}</p>
                      <p className="text-sm text-gray-600">Time: {returnItem.time}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Return
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No returns scheduled for today.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyOperations;