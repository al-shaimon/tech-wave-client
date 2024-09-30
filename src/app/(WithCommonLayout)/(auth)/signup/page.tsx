/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SignupFormInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const signupForm = useForm<SignupFormInput>();
  const router = useRouter();

  const onSignupSubmit: SubmitHandler<SignupFormInput> = async (data) => {
    const { ...signupData } = data;

    setIsLoading(true);
    toast("Signing up...", { duration: 2000 });

    try {
      const response = await axios.post(
        `${envConfig.baseApi}/auth/signup`,
        signupData,
      );
      console.log("Signup success", response.data);
      toast.success("Signup successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Signup failed", error);
      if (error?.response?.data?.message?.includes("E11000")) {
        setErrorMessage("User already exists! Please log in.");
        toast.error("User already exists!");
      } else {
        setErrorMessage(
          "Signup failed: " + error?.response?.data?.message ||
            "Something went wrong.",
        );
        toast.error("Signup failed!");
      }
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
        <h2 className="mt-4 text-center text-2xl font-bold">Sign Up</h2>

        {errorMessage && (
          <p className="mt-2 text-center text-red-500">{errorMessage}</p>
        )}

        <form
          onSubmit={signupForm.handleSubmit(onSignupSubmit)}
          className="mt-6"
        >
          <div className="form-control my-2">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              placeholder="Name"
              className="input input-bordered"
              {...signupForm.register("name", { required: true })}
              disabled={isLoading}
            />
            {signupForm.formState.errors.name && (
              <span className="text-error">Name is required</span>
            )}
          </div>

          <div className="form-control my-2">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered"
              {...signupForm.register("email", { required: true })}
              disabled={isLoading}
            />
            {signupForm.formState.errors.email && (
              <span className="text-error">Email is required</span>
            )}
          </div>

          <div className="form-control my-2">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered"
              {...signupForm.register("password", { required: true })}
              disabled={isLoading}
            />
            {signupForm.formState.errors.password && (
              <span className="text-error">Password is required</span>
            )}
          </div>

          <div className="form-control my-2">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              placeholder="Confirm Password"
              className="input input-bordered"
              {...signupForm.register("confirmPassword", { required: true })}
              disabled={isLoading}
            />
            {signupForm.formState.errors.confirmPassword && (
              <span className="text-error">Confirm Password is required</span>
            )}
          </div>

          <div className="modal-action flex w-full items-center justify-center">
            <button
              type="submit"
              className="btn w-full rounded-full bg-primary text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </div>

          <p className="mt-4 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
