/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import Image from "next/image";
import Link from "next/link";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface CustomJwtPayload extends JwtPayload {
  profilePhoto?: string;
}

interface LoginFormInput {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const loginForm = useForm<LoginFormInput>();

  const setTokenInCookies = async (token: string) => {
    try {
      await axios.post("/api/set-cookie", { token });
    } catch (error) {
      console.error("Failed to set token in cookies", error);
      toast.error("Failed to set token in cookies");
    }
  };

  const onLoginSubmit: SubmitHandler<LoginFormInput> = async (data) => {
    setIsLoading(true);
    toast("Logging in...", { duration: 1500 });

    try {
      const response = await axios.post(
        `${envConfig.baseApi}/auth/signin`,
        data,
      );
      console.log("Login success", response.data);

      const token = response.data.token;

      // Store token in local storage
      localStorage.setItem("token", token);

      // Store the token in cookies via the server-side API route
      const decodedUser = jwtDecode<CustomJwtPayload>(token);
      await setTokenInCookies(token);
      toast.success("Login successful!");
      
      // Store profilePhoto in localStorage (if it exists)
      if (decodedUser.profilePhoto) {
        localStorage.setItem("profilePhoto", decodedUser.profilePhoto);
      }

      // Redirect to home or desired page
      window.location.href = "/";
    } catch (error: any) {
      console.error("Login failed", error);
      setErrorMessage(
        "Login failed: " +
          (error?.response?.data?.message || "Something went wrong."),
      );
      toast.error("Login failed!"); // Show error toast
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
        <h2 className="mt-4 text-center text-2xl font-bold">Login</h2>

        {errorMessage && (
          <p className="mt-2 text-center text-red-500">{errorMessage}</p>
        )}

        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="mt-6">
          <div className="form-control my-2">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered"
              {...loginForm.register("email", { required: true })}
              disabled={isLoading}
            />
            {loginForm.formState.errors.email && (
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
              {...loginForm.register("password", { required: true })}
              disabled={isLoading}
            />
            {loginForm.formState.errors.password && (
              <span className="text-error">Password is required</span>
            )}
          </div>

          <div className="modal-action flex w-full items-center justify-center">
            <button
              type="submit"
              className="btn w-full rounded-full bg-primary text-white"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </div>

          <p className="mt-4 text-sm">
            Forgot your password?{" "}
            <Link href="/forgot-password" className="text-primary underline">
              Reset Password
            </Link>
          </p>

          <p className="mt-4 text-sm">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-primary underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
