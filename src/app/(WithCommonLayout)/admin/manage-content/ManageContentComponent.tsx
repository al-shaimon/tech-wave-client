"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import FeedPost from "../../(home)/[home]/@NewsFeed/FeedPost";
import SkeletonLoader from "@/components/SkeletonLoader";

interface Post {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePhoto: string;
    email: string;
    isVerified: boolean;
  };
  content: string;
  images: string[];
  videos: string[];
  createdAt: string;
  votes: number;
  comments: number;
  isPaid: boolean;
  category: string;
}

export default function ManageContentComponent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${envConfig.baseApi}/posts`, {
        headers: { Authorization: `${token}` },
      });
      setPosts(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts.");
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${envConfig.baseApi}/posts/${postId}/admin`, {
          headers: { Authorization: `${token}` },
        });
        toast.success("Post deleted successfully");
        fetchPosts(); // Refresh the posts list
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post");
      }
    }
  };

  if (loading) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <div key={post._id} className="mb-4">
          <FeedPost
            key={post._id}
            post={{
              ...post,
              user: {
                ...post.user,
                username: `@${post.user.email.split("@")[0]}`,
                isFollowing: false,
              },
              timestamp: post.createdAt,
            }}
            onDelete={() => handleDeletePost(post._id)}
            isAdminView={true}
            hideFollowButton={true}
          />
        </div>
      ))}
    </div>
  );
}
