/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "sonner";
// import EditProfileModal from "./@profile/EditProfileModal";
// import VerificationModal from "./@profile/VerificationModal";
import envConfig from "@/config/envConfig";
import { useRouter } from "next/navigation";
import SkeletonLoader from "@/components/SkeletonLoader";
import dynamic from "next/dynamic";
import AnalyticsModal from "@/app/(WithCommonLayout)/(user)/profile/AnalyticsModal";
import VerificationModal from "./@profile/VerificationModal";

const EditProfileModal = dynamic(() => import("./@profile/EditProfileModal"), {
  ssr: false,
});
const UserPosts = dynamic(() => import("./@profile/UserPosts"), { ssr: false });
const FollowersModal = dynamic(() => import("./@profile/FollowersModal"), {
  ssr: false,
});
const FollowingModal = dynamic(() => import("./@profile/FollowingModal"), {
  ssr: false,
});

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
  posts: any[];
}

export default function ProfileContent() {
  if (typeof window === "undefined") {
    return null;
  }

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
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken: { id: string } = jwtDecode(token);
        setUserId(decodedToken.id);
        localStorage.setItem("userId", decodedToken.id);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const storedProfilePhoto =
          typeof window !== "undefined"
            ? localStorage.getItem("profilePhoto")
            : null;
        setProfilePhoto(storedProfilePhoto);
        const response = await axios.get(
          `${envConfig.baseApi}/auth/${userId}`,
          {
            headers: { Authorization: `${token}` },
          },
        );

        if (response.data.success) {
          const userData = response.data.data;
          console.log("User data received:", userData);
          setUser({
            id: userData._id,
            name: userData.name,
            email: userData.email,
            isVerified: userData.isVerified,
            profilePhoto: storedProfilePhoto || userData.profilePhoto,
            role: userData.role,
            phone: userData.phone,
            followersCount: userData.followersCount,
            followingCount: userData.followingCount,
            posts: userData.posts, // Make sure this is included
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
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
        if (updatedData.profilePhoto && typeof window !== "undefined") {
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
      if (typeof window !== "undefined") {
        window.location.reload();
      }
      router.refresh(); // Refresh the page to update the newsfeed
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleVerificationSuccess = async () => {
    setShowVerificationModal(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(
        `${envConfig.baseApi}/auth/${userId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.success) {
        setUser((prevUser) => ({ ...prevUser!, isVerified: true }));
        localStorage.setItem("isVerified", "true");
        toast.success("You are now verified!");
      }

      // Revalidate the posts tag
      await fetch("/api/revalidate?tag=posts");
      // Revalidate the followers and following tags
      await fetch("/api/revalidate?tag=followers");
      await fetch("/api/revalidate?tag=following");

      router.refresh(); // Refresh the page to update the profile
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast.error("Failed to update verification status. Please try again.");
    }
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
        <div className="flex flex-col justify-between px-4 md:flex-row">
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
                    onClick={() => setShowVerificationModal(true)}
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

          <div className="mt-2 flex w-full gap-1 md:mt-0 md:w-auto md:flex-row">
            <button
              className="btn btn-sm mr-2 w-1/2 rounded border border-gray-300 px-4 py-2 text-xs text-white md:btn-md hover:bg-base-300 md:w-auto md:text-base"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>
            <button
              className="btn btn-sm mr-2 w-1/2 rounded border border-gray-300 px-4 py-2 text-xs text-white md:btn-md hover:bg-base-300 md:w-auto md:text-base"
              onClick={() => setShowAnalyticsModal(true)}
            >
              View Analytics
            </button>
          </div>
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
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onSuccess={handleVerificationSuccess}
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
          <UserPosts userId={user.id} />
        </div>
      )}

      {showAnalyticsModal && user && (
        <AnalyticsModal
          onClose={() => setShowAnalyticsModal(false)}
          posts={user.posts || []}
          userId={user.id}
        />
      )}
    </div>
  );
}