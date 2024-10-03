/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "sonner";
import EditProfileModal from "./@profile/EditProfileModal";
import VerificationModal from "./@profile/VerificationModal";
import envConfig from "@/config/envConfig";
import { useRouter } from "next/navigation";
import SkeletonLoader from "@/components/SkeletonLoader";
import UserPosts from "./@profile/UserPosts";

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
  const [profilePhoto, setProfilePhoto] = useState<any | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode token to get user ID
        const decodedUser: { id: string } = jwtDecode(token);
        setProfilePhoto(localStorage.getItem("profilePhoto"));

        axios
          .get(`${envConfig.baseApi}/auth/${decodedUser.id}`)
          .then((response) => {
            if (response.data.success) {
              const userData = response.data.data;
              setUser({
                id: userData._id,
                name: userData.name,
                email: userData.email,
                isVerified: userData.isVerified,
                phone: userData.phone,
                profilePhoto: profilePhoto || userData.profilePhoto,
                role: userData.role,
              });
            } else {
              toast.error("Failed to retrieve user information.");
            }
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
            toast.error("Failed to load user information. Please try again.");
          });
      } catch (error) {
        console.error("Invalid token:", error);
        toast.error("Failed to decode user information. Please log in again.");
      }
    }
  }, [profilePhoto]);

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
        if (updatedData.profilePhoto) {
          localStorage.setItem("profilePhoto", updatedData.profilePhoto);
        }
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
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="mx-auto py-4">
      <div>
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center">
            <Image
              className="rounded-full"
              src={profilePhoto!}
              alt={user.name}
              width={80}
              height={80}
            />
            <div className="ml-4">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                {user.isVerified === true ? (
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
                    className="ml-2 rounded bg-blue-500 px-2 text-sm text-white"
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
            className="rounded border border-gray-300 px-4 py-2 hover:bg-base-300"
            onClick={() => setShowEditModal(true)}
          >
            Edit Profile
          </button>
        </div>

        <div className="mt-4 flex px-4">
          <div className="mr-4">
            <span className="font-bold">100</span>
            <span className="text-gray-500"> Followers</span>
          </div>
          <div>
            <span className="font-bold">50</span>
            <span className="text-gray-500"> Following</span>
          </div>
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
          userId={user.id}
        />
      )}

      {user && (
        <div className="mt-8 border-t border-grey">
          {/* <h2 className="mb-4 text-2xl font-bold">My Posts</h2> */}
          <UserPosts userId={user.id} />
        </div>
      )}
    </div>
  );
}
