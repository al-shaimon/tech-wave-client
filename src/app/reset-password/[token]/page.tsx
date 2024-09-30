/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import Image from "next/image";
import envConfig from "@/config/envConfig";

// Form input types
interface ResetPasswordFormInput {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInput>();
  const router = useRouter();

  const onSubmit: SubmitHandler<ResetPasswordFormInput> = async (data) => {
    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(
        `${envConfig.baseApi}/auth/reset-password/${token}`,
        {
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
      );

      if (response.data.success) {
        setSuccessMessage(
          "Password reset successfully. Redirecting to home...",
        );
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setErrorMessage(response.data.message || "Something went wrong.");
      }
    } catch (error: any) {
      setErrorMessage("Failed to reset password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-base-300 p-6 shadow-md">
        <div className="flex items-center justify-center">
          <Image src="/l3.png" width={200} height={100} alt="logo" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold">
          Reset Your Password
        </h2>

        {successMessage ? (
          <p className="mt-4 text-green-600">{successMessage}</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            <div className="form-control my-4">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <input
                type="password"
                placeholder="New Password"
                className="input input-bordered w-full"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <span className="text-error">{errors.password.message}</span>
              )}
            </div>

            <div className="form-control my-4">
              <label className="label">
                <span className="label-text">Confirm New Password</span>
              </label>
              <input
                type="password"
                placeholder="Confirm New Password"
                className="input input-bordered w-full"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                })}
              />
              {errors.confirmPassword && (
                <span className="text-error">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {errorMessage && (
              <p className="my-2 text-center text-error">{errorMessage}</p>
            )}

            <div className="form-control mt-6 flex w-full items-center justify-center">
              <button
                type="submit"
                className="btn w-full rounded-full bg-primary text-white"
              >
                Reset Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
