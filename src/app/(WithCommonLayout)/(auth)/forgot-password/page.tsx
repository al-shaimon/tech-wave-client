/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import Image from "next/image";
import Link from "next/link";

interface ForgotPasswordFormInput {
  email: string;
}

export default function ForgotPasswordPage() {
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const forgotPasswordForm = useForm<ForgotPasswordFormInput>();

  const onForgotPasswordSubmit: SubmitHandler<ForgotPasswordFormInput> = async (
    data,
  ) => {
    setIsLoading(true);
    toast("Sending reset link...", { duration: 1500 });

    try {
      const response = await axios.post(
        `${envConfig.baseApi}/auth/forget-password`,
        data,
      );
      console.log("Reset link sent", response.data);
      toast.success("Reset link sent! Check your email.");
    } catch (error: any) {
      console.error("Error sending reset link", error);
      setErrorMessage(
        "Error sending reset link: " + error?.response?.data?.message ||
          "Something went wrong.",
      );
      toast.error("Error sending reset link!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-base-300 p-6 shadow-md">
        <div className="flex items-center justify-center">
          <Image src="/l3.png" width={200} height={100} alt="logo" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold">Forgot Password</h2>

        {errorMessage && (
          <p className="mt-2 text-center text-red-500">{errorMessage}</p>
        )}

        <form
          onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)}
          className="mt-6"
        >
          <div className="form-control my-2">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered"
              {...forgotPasswordForm.register("email", { required: true })}
              disabled={isLoading}
            />
            {forgotPasswordForm.formState.errors.email && (
              <span className="text-error">Email is required</span>
            )}
          </div>

          <div className="modal-action flex w-full items-center justify-center">
            <button
              type="submit"
              className="btn w-full rounded-full bg-primary text-white"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>

          <p className="mt-4 text-sm">
            Remembered your password?{" "}
            <Link href="/login" className="text-primary underline">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
