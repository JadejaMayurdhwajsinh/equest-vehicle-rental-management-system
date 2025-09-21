import React from "react";

const VehicleCard = ({ vehicle, onBook }) => {
  if (!vehicle) return null;

  const isAvailable = vehicle.status === "available";

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col md:flex-row justify-between p-5">
      
      {/* Vehicle Info */}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
        <p className="text-sm text-gray-500 mb-2">{vehicle.category?.name}</p>

        <div className="flex flex-wrap text-gray-600 mb-2">
          <span className="mr-4 flex items-center"><i className="fas fa-gas-pump mr-1"></i> {vehicle.fuel_type}</span>
          <span className="mr-4 flex items-center"><i className="fas fa-users mr-1"></i> {vehicle.seating_capacity} seats</span>
          <span className="flex items-center"><i className="fas fa-map-marker-alt mr-1"></i> {vehicle.location}</span>
        </div>

        <p className="text-sm text-gray-500 mb-1">Vehicle No: {vehicle.vehicle_number}</p>

        {/* Availability Badge */}
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isAvailable ? "Available" : "Unavailable"}
        </span>
      </div>

      {/* Booking / Price */}
      <div className="mt-4 md:mt-0 md:text-right flex flex-col justify-between">
        <div className="mb-3">
          <h4 className="text-xl font-bold text-sky-600">${vehicle.daily_rate}/day</h4>
        </div>
        <button
          className={`px-5 py-2 rounded-lg font-semibold transition-colors duration-200 ${
            isAvailable
              ? "bg-sky-600 hover:bg-sky-700 text-white"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
          onClick={() => isAvailable && onBook(vehicle)}
          disabled={!isAvailable}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
