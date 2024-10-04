import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import envConfig from "@/config/envConfig";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface VerificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const PaymentForm = ({ onSuccess, onClose }: VerificationModalProps) => {
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

    const { error } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.error(error);
      setIsProcessing(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.post(
        `${envConfig.baseApi}/auth/update-profile`,
        { isVerified: true },
        {
          headers: {
            Authorization: `${token}`,
          },
        },
      );

      if (response.data.success) {
        onSuccess();
      } else {
        console.error("Failed to update verification status");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsProcessing(false);
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

export default function VerificationModal({
  onClose,
  onSuccess,
  userId,
}: VerificationModalProps) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div className="w-full max-w-md rounded-lg bg-base-300 p-6">
        <h2 className="mb-4 text-center text-2xl font-bold">Get Verified</h2>
        <p className="mb-4">
          Pay <span className="font-bold text-primary">$20</span> to get a blue
          verification badge for your account.
        </p>
        <Elements stripe={stripePromise}>
          <PaymentForm
            onSuccess={onSuccess}
            onClose={onClose}
            userId={userId}
          />
        </Elements>
      </div>
    </div>
  );
}
