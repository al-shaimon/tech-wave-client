/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("your-publishable-key-here");

interface StripeModalProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function StripeModal({
  amount,
  onSuccess,
  onClose,
}: StripeModalProps) {
  const handlePayment = async () => {
    const stripe = await stripePromise;
    const response = await fetch("/api/stripe-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });
    const session = await response.json();
    if (!stripe) {
      console.error("Stripe failed to load.");
      return;
    }
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold">Verify Your Account</h2>
        <p className="mb-4">Pay $20 to get verified.</p>
        <button
          className="mb-4 rounded bg-blue-500 px-4 py-2 text-white"
          onClick={handlePayment}
        >
          Pay with Stripe
        </button>
        <button className="text-gray-500 hover:text-gray-800" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
