/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentForm = ({ onSuccess, onClose }: PaymentModalProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.error(error);
      setIsProcessing(false);
    } else {
      // Here you would typically send the paymentMethod.id to your server
      // and handle the payment there. For this example, we'll just call onSuccess.
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#ffffff",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="btn mr-2 bg-gray-700 px-4 py-2 text-white hover:bg-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn bg-primary px-4 py-2 text-white hover:bg-blue-600"
          disabled={isProcessing || !stripe}
        >
          {isProcessing ? "Processing..." : "Pay $20"}
        </button>
      </div>
    </form>
  );
};

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div className="mx-4 w-full max-w-lg rounded-lg bg-base-300 p-6 md:mx-0">
        <h2 className="mb-4 text-center text-2xl font-bold">
          Verify & Unlock Post
        </h2>
        <p className="mb-5 text-center">
          Pay <span className="font-bold text-primary">$20</span> to unlock all
          premium posts and get verified.
        </p>
        <Elements stripe={stripePromise}>
          <PaymentForm
            onSuccess={onSuccess}
            onClose={onClose}
            isOpen={isOpen}
          />
        </Elements>
      </div>
    </div>
  );
}
