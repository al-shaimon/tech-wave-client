"use client";

import { useRouter } from "next/navigation"; // from 'next/navigation' in App Router
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Send POST request to the /api/logout route
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("profilePhoto");
        localStorage.removeItem("isVerified");

        toast.success("Logged out successfully");
        window.location.href = "/login";
        router.refresh();
      } else {
        console.error("Failed to log out");
        toast.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error during logout");
    }
  };

  return (
    <button onClick={handleLogout} className="btn bg-error text-white">
      Logout
    </button>
  );
}
