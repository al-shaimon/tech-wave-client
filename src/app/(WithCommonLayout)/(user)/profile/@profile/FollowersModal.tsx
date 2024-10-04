import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import SkeletonLoader from "@/components/SkeletonLoader";

interface Follower {
  _id: string;
  name: string;
  email: string;
  profilePhoto: string;
  isVerified: boolean;
  isFollowing: boolean;
}

interface FollowersModalProps {
  onClose: () => void;
  userId: string;
  updateFollowCounts: (followersDelta: number, followingDelta: number) => void;
}

export default function FollowersModal({
  onClose,
  updateFollowCounts,
}: FollowersModalProps) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${envConfig.baseApi}/auth/followers-following`,
          {
            headers: { Authorization: `${token}` },
            next: { tags: ["followers"] },
          },
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFollowers(
              data.data.followers.map((follower: Follower) => ({
                ...follower,
                isFollowing: data.data.following.some(
                  (f: Follower) => f._id === follower._id,
                ),
              })),
            );
          }
        }
      } catch (error) {
        console.error("Error fetching followers:", error);
        toast.error("Failed to load followers.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, []);

  const handleFollowUnfollow = async (followerId: string) => {
    const follower = followers.find((f) => f._id === followerId);
    try {
      const token = localStorage.getItem("token");

      if (!follower) return;

      const endpoint = follower.isFollowing ? "unfollow" : "follow";

      await axios.post(
        `${envConfig.baseApi}/auth/${endpoint}/${followerId}`,
        {},
        {
          headers: { Authorization: `${token}` },
        },
      );

      setFollowers((prevFollowers) =>
        prevFollowers.map((f) =>
          f._id === followerId ? { ...f, isFollowing: !f.isFollowing } : f,
        ),
      );

      // Update follow counts
      updateFollowCounts(0, follower.isFollowing ? -1 : 1);

      // toast.success(
      //   `User ${follower.isFollowing ? "unfollowed" : "followed"} successfully`,
      // );

      // Revalidate the followers and following tags
      await fetch("/api/revalidate?tag=followers");
      await fetch("/api/revalidate?tag=following");
    } catch (error) {
      console.error(
        `Error ${follower?.isFollowing ? "unfollowing" : "following"} user:`,
        error,
      );
      toast.error(
        `Failed to ${follower?.isFollowing ? "unfollow" : "follow"} user.`,
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-base-300 p-6">
        <h2 className="mb-4 text-center text-2xl font-bold">Followers</h2>
        {loading ? (
          <p>
            <SkeletonLoader />
          </p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {followers.map((follower) => (
              <li
                key={follower._id}
                className="mb-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Image
                    src={follower.profilePhoto}
                    alt={follower.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <p className="font-semibold">{follower.name}</p>
                      <p className="font-semibold">
                        {follower.isVerified === true ? (
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
                      @{follower.email.split("@")[0]}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleFollowUnfollow(follower._id)}
                  className={`rounded px-3 py-1 text-white ${
                    follower.isFollowing
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {follower.isFollowing ? "Unfollow" : "Follow"}
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
