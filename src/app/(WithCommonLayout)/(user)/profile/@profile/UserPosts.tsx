/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import FeedPost from "../../../(home)/[home]/@NewsFeed/FeedPost";
import SkeletonLoader from "@/components/SkeletonLoader";

interface UserPostsProps {
  userId: string;
}

interface Post {
  _id: string;
  content: string;
  images: string[];
  videos: string[];
  votes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export default function UserPosts({ userId }: UserPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get(
          `${envConfig.baseApi}/auth/${userId}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          },
        );

        if (response.data.success) {
          const userData = response.data.data;
          setUserInfo(userData);
          // Sort posts by createdAt in descending order
          const sortedPosts = (userData.posts || []).sort(
            (a: Post, b: Post) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          setPosts(sortedPosts);
        } else {
          toast.error("Failed to fetch user posts.");
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
        toast.error("Failed to load user posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div>
      {posts.length > 0 ? (
        posts.map((post) => (
          <FeedPost
            key={post._id}
            post={{
              ...post,
              user: {
                profilePhoto: userInfo.profilePhoto,
                username: `@${userInfo.email.split("@")[0]}`,
                name: userInfo.name,
              },
              timestamp: post.createdAt,
            }}
          />
        ))
      ) : (
        <p className="text-center text-gray-500">No posts available</p>
      )}
    </div>
  );
}
