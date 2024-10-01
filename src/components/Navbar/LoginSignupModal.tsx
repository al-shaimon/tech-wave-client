/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import clsx from "clsx";
import React from "react";
import Image from "next/image";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";

// Form input types
interface LoginFormInput {
  email: string;
  password: string;
}

interface SignupFormInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ForgotPasswordInput {
  email: string;
}

export default function LoginSignupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Toggle for forgot password
  const [resetLinkSent, setResetLinkSent] = useState(false); // State to manage the reset link sent
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [isLoading, setIsLoading] = useState(false); // Loading state to disable buttons during API calls

  const loginForm = useForm<LoginFormInput>();
  const signupForm = useForm<SignupFormInput>();
  const forgotPasswordForm = useForm<ForgotPasswordInput>();

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setIsLogin(true); // Reset state when closing
    setIsForgotPassword(false); // Reset forgot password state
    setResetLinkSent(false); // Reset reset link sent state
    setErrorMessage(""); // Clear error message
  };

  const setTokenInCookies = async (token: string) => {
    try {
      await axios.post("/api/set-cookie", { token });
    } catch (error) {
      console.error("Failed to set token in cookies", error);
      toast.error("Failed to set token in cookies");
    }
  };

  // Login form submit handler
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
      await setTokenInCookies(token);

      toast.success("Login successful!");
      closeModal();
      window.location.href = "/";
    } catch (error: any) {
      console.error("Login failed", error);
      setErrorMessage(
        "Login failed: " + error?.response?.data?.message ||
          "Something went wrong.",
      );
      toast.error("Login failed!"); // Show error toast
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  // Signup form submit handler
  const onSignupSubmit: SubmitHandler<SignupFormInput> = async (data) => {
    const { ...signupData } = data;

    setIsLoading(true); // Set loading state
    toast("Signing up...", { duration: 2000 }); // Show toast for signup process

    try {
      const response = await axios.post(
        `${envConfig.baseApi}/auth/signup`,
        signupData,
      );
      console.log("Signup success", response.data);
      toast.success("Signup successful!"); // Show success toast
      closeModal();
    } catch (error: any) {
      console.error("Signup failed", error);
      if (error?.response?.data?.message?.includes("E11000")) {
        setErrorMessage("User already exists! Please log in.");
        toast.error("User already exists!"); // Show error toast
      } else {
        setErrorMessage(
          "Signup failed: " + error?.response?.data?.message ||
            "Something went wrong.",
        );
        toast.error("Signup failed!"); // Show generic error toast
      }
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Forgot Password form submit handler
  const onForgotPasswordSubmit: SubmitHandler<ForgotPasswordInput> = async (
    data,
  ) => {
    setIsLoading(true); // Set loading state to true
    toast("Sending reset link...", { duration: 2000 }); // Show toast for sending reset link

    try {
      const response = await axios.post(
        `${envConfig.baseApi}/auth/forget-password`,
        data,
      );
      console.log("Reset link sent", response.data);
      setResetLinkSent(true); // Set the state to indicate that the link has been sent
      setErrorMessage(""); // Clear error message
      toast.success("Reset link sent! Check your email."); // Show success toast
    } catch (error: any) {
      console.error("Error sending reset link", error);
      setErrorMessage(
        "Error: " + error.response.data.message || "Something went wrong.",
      );
      toast.error("Failed to send reset link!"); // Show error toast
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <>
      <button
        className="btn rounded-full bg-primary text-white"
        onClick={openModal}
      >
        Log In
      </button>
      {isOpen && (
        <div
          className={clsx(
            "fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 transition-opacity",
            isOpen ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="animate-fade-in-up modal-box relative">
            <button
              className="btn btn-sm absolute right-2 top-2"
              onClick={closeModal}
            >
              ✕
            </button>

            <div className="flex items-center justify-center">
              <Image src="/l3.png" width={200} height={100} alt="logo" />
            </div>

            <h3 className="mt-4 text-center text-lg font-bold md:text-2xl">
              {isForgotPassword
                ? "Forgot Password"
                : isLogin
                  ? "Login"
                  : "Sign Up"}
            </h3>

            {errorMessage && (
              <p className="mt-2 text-center text-red-500">{errorMessage}</p>
            )}

            {isForgotPassword ? (
              // Forgot Password Form
              <form
                onSubmit={forgotPasswordForm.handleSubmit(
                  onForgotPasswordSubmit,
                )}
              >
                <div className="form-control my-2">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    className="input input-bordered"
                    {...forgotPasswordForm.register("email", {
                      required: true,
                    })}
                    disabled={isLoading} // Disable when loading
                  />
                  {forgotPasswordForm.formState.errors.email && (
                    <span className="text-error">Email is required</span>
                  )}
                </div>

                <div className="modal-action flex w-full items-center justify-center">
                  <button
                    type="submit"
                    className="btn w-full rounded-full bg-primary text-white"
                    disabled={isLoading} // Disable button when loading
                  >
                    {isLoading ? "Sending..." : "Send Password Reset Link"}
                  </button>
                </div>

                {resetLinkSent && (
                  <p className="mt-4 text-green-500">
                    Reset link sent! Please check your email.
                  </p>
                )}

                <p className="mt-4 text-sm">
                  Remembered your password?{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => setIsForgotPassword(false)}
                  >
                    Log In
                  </button>
                </p>
              </form>
            ) : isLogin ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <div className="form-control my-2">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    className="input input-bordered"
                    {...loginForm.register("email", { required: true })}
                    disabled={isLoading} // Disable when loading
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
                    disabled={isLoading} // Disable when loading
                  />
                  {loginForm.formState.errors.password && (
                    <span className="text-error">Password is required</span>
                  )}
                </div>

                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => setIsForgotPassword(true)}
                >
                  Forgot Password?
                </button>

                <div className="modal-action flex w-full items-center justify-center">
                  <button
                    type="submit"
                    className="btn w-full rounded-full bg-primary text-white"
                    disabled={isLoading} // Disable button when loading
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </button>
                </div>

                <p className="mt-4 text-sm">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => setIsLogin(false)}
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
                <div className="form-control my-2">
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    className="input input-bordered"
                    {...signupForm.register("name", { required: true })}
                    disabled={isLoading} // Disable when loading
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
                    disabled={isLoading} // Disable when loading
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
                    disabled={isLoading} // Disable when loading
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
                    {...signupForm.register("confirmPassword", {
                      required: true,
                    })}
                    disabled={isLoading} // Disable when loading
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <span className="text-error">
                      Confirm Password is required
                    </span>
                  )}
                </div>

                <div className="modal-action flex w-full items-center justify-center">
                  <button
                    type="submit"
                    className="btn w-full rounded-full bg-primary text-white"
                    disabled={isLoading} // Disable button when loading
                  >
                    {isLoading ? "Signing up..." : "Sign Up"}
                  </button>
                </div>

                <p className="mt-4 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => setIsLogin(true)}
                  >
                    Log In
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
