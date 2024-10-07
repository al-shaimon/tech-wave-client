/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import envConfig from "@/config/envConfig";
import { toast } from "sonner";



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
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${envConfig.baseApi}/payments/create-payment-intent`,
          {},
          { headers: { Authorization: `${token}` } }
        );
        setClientSecret(response.data.data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast.error('Failed to initialize payment. Please try again.');
      }
    };

    createPaymentIntent();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      console.error(error);
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${envConfig.baseApi}/payments/confirm-payment`,
          { paymentIntentId: paymentIntent.id },
          { headers: { Authorization: `${token}` } }
        );
        localStorage.setItem('isVerified', 'true');
        onSuccess();
      } catch (confirmError) {
        console.error('Error confirming payment:', confirmError);
        toast.error('Payment succeeded, but verification failed. Please contact support.');
      }
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
