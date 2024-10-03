"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "sonner";
import EditProfileModal from "@/app/(WithCommonLayout)/(user)/profile/@profile/EditProfileModal";
import VerificationModal from "@/app/(WithCommonLayout)/(user)/profile/@profile/VerificationModal";
import envConfig from "@/config/envConfig";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  phone: string;
  profilePhoto: string;
  role: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser: User = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("Invalid token:", error);
        toast.error("Failed to decode user information. Please log in again.");
      }
    }
  }, []);

  const handleEditProfile = async (updatedData: Partial<User>) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.post(
        `${envConfig.baseApi}/auth/update-profile`,
        updatedData,
        {
          headers: {
            Authorization: `${token}`,
          },
        },
      );

      if (response.data.success) {
        setUser((prevUser) => ({ ...prevUser!, ...updatedData }));
        toast.success("Profile updated successfully!");
        setShowEditModal(false);
      }

      // Revalidate the posts tag
      await fetch("/api/revalidate?tag=posts");

      router.refresh(); // Refresh the page to update the newsfeed
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleVerification = () => {
    setShowVerificationModal(true);
  };

  const handleVerificationSuccess = () => {
    setUser((prevUser) => ({ ...prevUser!, isVerified: true }));
    setShowVerificationModal(false);
    toast.success("Your account has been verified!");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Image
            className="rounded-full"
            src={user.profilePhoto}
            alt={user.name}
            width={80}
            height={80}
          />
          <div className="ml-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              {user.isVerified ? (
                <>
                  <Image
                    className="ml-2"
                    src="/verified.svg"
                    alt="Verified"
                    width={20}
                    height={20}
                  />
                </>
              ) : (
                <button
                  className="ml-2 rounded bg-blue-500 px-2 py-1 text-white"
                  onClick={handleVerification}
                >
                  Get Verified
                </button>
              )}
            </div>
            <p className="text-gray-500">@{user.email.split("@")[0]}</p>
          </div>
        </div>
        <button
          className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
          onClick={() => setShowEditModal(true)}
        >
          Edit Profile
        </button>
      </div>

      <div className="mt-4 flex">
        <div className="mr-4">
          <span className="font-bold">100</span>
          <span className="text-gray-500"> Followers</span>
        </div>
        <div>
          <span className="font-bold">50</span>
          <span className="text-gray-500"> Following</span>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditProfile}
        />
      )}

      {showVerificationModal && (
        <VerificationModal
          onClose={() => setShowVerificationModal(false)}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </div>
  );
}
