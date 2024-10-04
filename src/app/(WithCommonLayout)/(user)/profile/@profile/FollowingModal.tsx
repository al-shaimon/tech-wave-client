import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import SkeletonLoader from "@/components/SkeletonLoader";

interface Following {
  _id: string;
  name: string;
  email: string;
  profilePhoto: string;
  isVerified: boolean;
}

interface FollowingModalProps {
  onClose: () => void;
  userId: string;
  updateFollowCounts: (followersDelta: number, followingDelta: number) => void;
}

export default function FollowingModal({
  onClose,
  updateFollowCounts,
}: FollowingModalProps) {
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${envConfig.baseApi}/auth/followers-following`,
          {
            headers: { Authorization: `${token}` },
            next: { tags: ["following"] },
          },
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFollowing(data.data.following);
          }
        }
      } catch (error) {
        console.error("Error fetching following:", error);
        toast.error("Failed to load following users.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, []);

  const handleUnfollow = async (followingId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${envConfig.baseApi}/auth/unfollow/${followingId}`,
        {},
        {
          headers: { Authorization: `${token}` },
        },
      );
      // toast.success("User unfollowed successfully");
      // Update the UI to reflect the change
      setFollowing(following.filter((user) => user._id !== followingId));
      // Update follow counts
      updateFollowCounts(0, -1);
      // Revalidate the followers and following tags
      await fetch("/api/revalidate?tag=followers");
      await fetch("/api/revalidate?tag=following");
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow user.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-base-300 p-6">
        <h2 className="mb-4 text-center text-2xl font-bold">Following</h2>
        {loading ? (
          <p>
            <SkeletonLoader />
          </p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {following.map((user) => (
              <li
                key={user._id}
                className="mb-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Image
                    src={user.profilePhoto}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <p className="font-semibold">{user.name}</p>
                      <p className="font-semibold">
                        {user.isVerified === true ? (
                          <Image
                            className="ml-[3px] mr-[5px]"
                            src="/verified.svg"
                            alt="Verified"
                            width={20}
                            height={20}
                          />
                        ) : (
                          ""
                        )}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      @{user.email.split("@")[0]}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnfollow(user._id)}
                  className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                >
                  Unfollow
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onClose}
          className="btn mr-2 mt-4 w-full bg-gray-700 px-4 py-2 text-white hover:bg-gray-900"
        >
          Close
        </button>
      </div>
    </div>
  );
}
