// src/components/BookingCard.jsx
import React from "react";

const BookingCard = ({ booking, onCancel }) => {
  const {
    vehicle,
    pickup_date,
    return_date,
    status,
    total_amount,
    payment_status,
    pickup_location,
    return_location,
  } = booking;

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2 py-1 text-sm bg-green-200 text-green-800 rounded-full">Confirmed</span>;
      case "pending":
        return <span className="px-2 py-1 text-sm bg-yellow-200 text-yellow-800 rounded-full">Pending</span>;
      case "cancelled":
        return <span className="px-2 py-1 text-sm bg-red-200 text-red-800 rounded-full">Cancelled</span>;
      case "completed":
        return <span className="px-2 py-1 text-sm bg-gray-200 text-gray-800 rounded-full">Completed</span>;
      default:
        return <span className="px-2 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="border rounded-lg shadow-md p-4 mb-4 bg-white hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h2>ID : {booking.id}</h2>
          <h3 className="text-lg font-semibold">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
          <p className="text-gray-500 text-sm">{vehicle.vehicle_number}</p>
          <p className="text-gray-600 mt-1">
            Pickup: {pickup_location} ({formatDate(pickup_date)})<br />
            Return: {return_location} ({formatDate(return_date)})
          </p>
        </div>
        <div className="text-right space-y-1">
          {getStatusBadge(status)}
          <p className="text-gray-700 font-medium">Amount: ${total_amount}</p>
          <p className="text-gray-500 text-sm">Payment: {payment_status}</p>
        </div>
      </div>
      {status === "confirmed" && onCancel && (
        <div className="mt-4 text-right">
          <button
            onClick={() => onCancel(booking.id)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Cancel Booking
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
