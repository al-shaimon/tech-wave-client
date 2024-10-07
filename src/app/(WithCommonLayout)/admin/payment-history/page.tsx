import PaymentHistoryComponent from "@/app/(WithCommonLayout)/admin/payment-history/PaymentHistoryComponent";
import React from "react";

export default function PaymentHistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Payment History</h1>
      <PaymentHistoryComponent />
    </div>
  );
}
