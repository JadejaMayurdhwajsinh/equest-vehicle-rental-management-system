import React, { useEffect, useState } from "react";
import API from "../../Services/api";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const res = await API.get("/payments/my");
    setPayments(res.data);
  };

  return (
    <div>
      <h2>Payment History</h2>
      {payments.length === 0 ? (
        <p>No payment records found.</p>
      ) : (
        <ul>
          {payments.map((p) => (
            <li key={p._id}>
              {p.vehicleName} - ₹{p.amount} - {new Date(p.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PaymentHistory;
