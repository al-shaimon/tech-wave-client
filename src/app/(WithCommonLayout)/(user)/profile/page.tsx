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
import FollowersModal from "@/app/(WithCommonLayout)/(user)/profile/@profile/FollowersModal";
import FollowingModal from "@/app/(WithCommonLayout)/(user)/profile/@profile/FollowingModal";

interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  phone: string;
  profilePhoto: string;
  role: string;
  followersCount: number;
  followingCount: number;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: { id: string } = jwtDecode(token);
      setUserId(decodedToken.id);
      localStorage.setItem("userId", decodedToken.id);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const token = localStorage.getItem("token");
        setProfilePhoto(localStorage.getItem("profilePhoto"));
        const response = await axios.get(
          `${envConfig.baseApi}/auth/${userId}`,
          {
            headers: { Authorization: `${token}` },
          },
        );

        if (response.data.success) {
          const userData = response.data.data;
          setUser({
            id: userData._id,
            name: userData.name,
            email: userData.email,
            isVerified: userData.isVerified,
            profilePhoto: profilePhoto || userData.profilePhoto,
            role: userData.role,
            phone: userData.phone,
            followersCount: userData.followersCount,
            followingCount: userData.followingCount,
          });
          setFollowersCount(userData.followersCount);
          setFollowingCount(userData.followingCount);
          setProfilePhoto(userData.profilePhoto);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data.");
      }
    };

    fetchUserData();
  }, [userId, profilePhoto]);

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
      // Revalidate the followers and following tags
      await fetch("/api/revalidate?tag=followers");
      await fetch("/api/revalidate?tag=following");

      router.push("/profile");
      window.location.reload();
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

  const updateFollowCounts = (
    followersDelta: number,
    followingDelta: number,
  ) => {
    setFollowersCount((prev) => prev + followersDelta);
    setFollowingCount((prev) => prev + followingDelta);
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
              className="h-12 w-12 rounded-full md:h-20 md:w-20"
              src={profilePhoto!}
              alt={user.name}
              width={80}
              height={80}
            />
            <div className="ml-4">
              <div className="flex items-center">
                <h2 className="font-bold md:text-2xl">{user.name}</h2>
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
                    className="ml-2 rounded bg-blue-500 px-2 text-xs text-white md:text-sm"
                    onClick={handleVerification}
                  >
                    Get Verified
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 md:text-base">
                @{user?.email?.split("@")[0]}
              </p>
            </div>
          </div>
          <button
            className="rounded border border-gray-300 px-4 py-2 text-xs hover:bg-base-300 md:text-base"
            onClick={() => setShowEditModal(true)}
          >
            Edit Profile
          </button>
        </div>

        <div className="mt-4 flex px-4">
          <div
            className="mr-4 cursor-pointer"
            onClick={() => setShowFollowersModal(true)}
          >
            <span className="text-sm font-bold md:text-base">
              {followersCount}
            </span>
            <span className="text-sm text-gray-500 md:text-base">
              {" "}
              Followers
            </span>
          </div>
          <div
            className="cursor-pointer"
            onClick={() => setShowFollowingModal(true)}
          >
            <span className="text-sm font-bold md:text-base">
              {followingCount}
            </span>
            <span className="text-sm text-gray-500 md:text-base">
              {" "}
              Following
            </span>
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

      {showFollowersModal && (
        <FollowersModal
          onClose={() => setShowFollowersModal(false)}
          userId={user.id}
          updateFollowCounts={updateFollowCounts}
        />
      )}

      {showFollowingModal && (
        <FollowingModal
          onClose={() => setShowFollowingModal(false)}
          userId={user.id}
          updateFollowCounts={updateFollowCounts}
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
