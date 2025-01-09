"use client";

import { clearAnalyticsData } from "@/utils/utilts";
import { useRouter } from "next/navigation"; // from 'next/navigation' in App Router
import { toast } from "sonner";

interface LogoutButtonProps {
  onClick?: () => void;
}

export default function LogoutButton({ onClick }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("profilePhoto");
        localStorage.removeItem("isVerified");

        clearAnalyticsData();

        toast.success("Logged out successfully");
        window.location.href = "/login";
        router.refresh();
      } else {
        toast.error("Failed to log out");
      }
    } catch {
      toast.error("Error during logout");
    }
  };

  return (
    <button
      onClick={() => {
        handleLogout();
        onClick?.();
      }}
      className="btn bg-error text-white"
    >
      Logout
    </button>
  );
}
