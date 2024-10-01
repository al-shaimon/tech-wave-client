"use client";

import { useRouter } from "next/navigation"; // from 'next/navigation' in App Router

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Send POST request to the /api/logout route
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      localStorage.removeItem("token");

      if (response.ok) {
        // On success, redirect to the home page or refresh the app state
        router.push("/");
        router.refresh(); // Reload the page to reflect the updated auth state
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <button onClick={handleLogout} className="btn btn-ghost">
      Logout
    </button>
  );
}
