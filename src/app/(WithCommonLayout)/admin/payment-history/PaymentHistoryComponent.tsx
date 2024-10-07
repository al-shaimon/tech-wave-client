"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import { format } from "date-fns";
import SkeletonLoader from "@/components/SkeletonLoader";

interface Payment {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  amount: number;
  status: string;
  invoiceNumber: string;
  createdAt: string;
}

export default function PaymentHistoryComponent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${envConfig.baseApi}/payments`, {
        headers: { Authorization: `${token}` },
      });
      setPayments(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      toast.error("Failed to load payment history.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Email</th>
            <th>Amount</th>
            {/* <th>Status</th> */}
            <th>Invoice Number</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment._id}>
              <td>{payment.userId.name}</td>
              <td>{payment.userId.email}</td>
              <td>${payment.amount}</td>
              {/* <td>{payment.status}</td> */}
              <td>{payment.invoiceNumber}</td>
              <td>{format(new Date(payment.createdAt), "PPpp")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
