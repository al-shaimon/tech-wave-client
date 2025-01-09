"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import { jwtDecode } from "jwt-decode";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePhoto: string;
  isVerified: boolean;
  followers: string[];
}

export default function RightSidebar() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [followingStatus, setFollowingStatus] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: { id: string } = jwtDecode(token);
      setCurrentUserId(decoded.id);
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${envConfig.baseApi}/auth/users`);
      if (response.data.success) {
        // Filter out current user and get random 5 users
        const filteredUsers = response.data.data.users
          .filter((user: User) => user._id !== currentUserId)
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);

        setUsers(filteredUsers);

        // Initialize following status
        const followingMap: { [key: string]: boolean } = {};
        filteredUsers.forEach((user: User) => {
          followingMap[user._id] = user.followers.includes(currentUserId);
        });
        setFollowingStatus(followingMap);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleFollowUnfollow = async (userId: string) => {
    if (!currentUserId) {
      toast.error("Please login to follow users");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const endpoint = followingStatus[userId] ? "unfollow" : "follow";

      const response = await axios.post(
        `${envConfig.baseApi}/auth/${endpoint}/${userId}`,
        {},
        {
          headers: { Authorization: `${token}` },
        },
      );

      if (response.data.success) {
        setFollowingStatus((prev) => ({
          ...prev,
          [userId]: !prev[userId],
        }));
        toast.success(`Successfully ${endpoint}ed user`);
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast.error("Failed to follow/unfollow user");
    }
  };

  return (
    <div className="rounded-lg bg-base-200 p-4">
      <h2 className="mb-4 text-xl font-bold">Suggested Users</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user._id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={user.profilePhoto || "/default-avatar.png"}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-semibold">{user.name}</p>
                  {user.isVerified && (
                    <Image
                      src="/verified.svg"
                      alt="Verified"
                      width={16}
                      height={16}
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  @{user.email.split("@")[0]}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleFollowUnfollow(user._id)}
              className={`btn btn-sm ${
                followingStatus[user._id] ? "btn-outline" : "btn-primary"
              }`}
            >
              {followingStatus[user._id] ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
