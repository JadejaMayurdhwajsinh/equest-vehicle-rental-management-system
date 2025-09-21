import React, { useEffect, useState } from "react";
import API from "../../Services/api";
// import BookingCard from "../BookingCard.jsx";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const res = await API.get("/bookings/my");
    setBookings(res.data);
  };

  return (
    <div>
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((b) => <BookingCard key={b._id} booking={b} />)
      )}
    </div>
  );
};

export default MyBookings;
