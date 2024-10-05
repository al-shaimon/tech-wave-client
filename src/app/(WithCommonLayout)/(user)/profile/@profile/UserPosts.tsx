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
  isPaid: boolean;
  category: string;
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
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${envConfig.baseApi}/auth/${userId}`,
          {
            headers: { Authorization: `${token}` },
          },
        );

        if (response.data.success) {
          const userData = response.data.data;
          setUserInfo(userData);
          setPosts(userData.posts || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading || !userInfo) {
    return <SkeletonLoader />;
  }

  return (
    <div className="m-1 md:m-3">
      {posts.length > 0 ? (
        posts.map((post) => (
          <FeedPost
            key={post._id}
            post={{
              ...post,
              user: {
                _id: userId,
                profilePhoto: userInfo.profilePhoto,
                username: `@${userInfo.email.split("@")[0]}`,
                name: userInfo.name,
                isVerified: userInfo.isVerified,
                isFollowing: false,
              },
              timestamp: post.createdAt,
              comments: post.comments || 0,
              isPaid: post.isPaid,
              category: post.category,
            }}
          />
        ))
      ) : (
        <p className="my-10 text-center text-gray-400">No posts available</p>
      )}
    </div>
  );
}
