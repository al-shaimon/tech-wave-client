import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface VerificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function VerificationModal({ onClose, onSuccess }: VerificationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    const stripe = await stripePromise;
    if (!stripe) {
      console.error("Stripe failed to load");
      setIsProcessing(false);
      return;
    }

    // Simulate a successful payment
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold">Get Verified</h2>
        <p className="mb-4">Pay $20 to get a blue verification badge for your account.</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Pay $20"}
          </button>
        </div>
      </div>
    </div>
  );
}