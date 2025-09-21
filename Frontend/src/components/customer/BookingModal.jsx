// src/components/customer/BookingModal.jsx
import React, { useEffect, useState } from "react";

const BookingModal = ({ show, onClose, vehicle, onConfirm }) => {
  const [bookingData, setBookingData] = useState({
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    returnLocation: "",
    paymentMethod: "card",
  });

  useEffect(() => {
    if (!show) {
      setBookingData({
        pickupDate: "",
        returnDate: "",
        pickupLocation: "",
        returnLocation: "",
        paymentMethod: "card",
      });
    }
  }, [show, vehicle]);

  if (!show || !vehicle) return null;

  const daysBetween = () => {
    if (!bookingData.pickupDate || !bookingData.returnDate) return 0;
    const start = new Date(bookingData.pickupDate);
    const end = new Date(bookingData.returnDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const dailyRate = vehicle.dailyRate || vehicle.daily_rate || 0;
  const total = daysBetween() * dailyRate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl z-10 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Book: {vehicle.make} {vehicle.model}</h3>
            <button onClick={onClose} className="text-slate-600 hover:text-slate-800">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Pickup Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={bookingData.pickupDate}
                onChange={(e) => setBookingData((b) => ({ ...b, pickupDate: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Return Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={bookingData.returnDate}
                onChange={(e) => setBookingData((b) => ({ ...b, returnDate: e.target.value }))}
                min={bookingData.pickupDate || new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Pickup Location</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={bookingData.pickupLocation}
                onChange={(e) => setBookingData((b) => ({ ...b, pickupLocation: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Return Location</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={bookingData.returnLocation}
                onChange={(e) => setBookingData((b) => ({ ...b, returnLocation: e.target.value }))}
              />
            </div>
          </div>

          <div className="border rounded p-3">
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-slate-500">Vehicle</div>
                <div className="font-medium">{vehicle.make} {vehicle.model}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Daily</div>
                <div className="font-semibold">${dailyRate}/day</div>
              </div>
            </div>

            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-slate-600">Rental period</div>
              <div className="font-medium">{daysBetween()} days</div>
            </div>

            <div className="mt-2 flex justify-between items-center">
              <div className="text-sm">Total</div>
              <div className="text-lg font-bold">${total.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded border text-slate-700 hover:bg-slate-50">Cancel</button>
          <button
            onClick={() => onConfirm({ vehicle, ...bookingData, total })}
            disabled={!bookingData.pickupDate || !bookingData.returnDate}
            className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
