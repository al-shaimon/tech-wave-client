/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import FeedPost from "../../../(home)/[home]/@NewsFeed/FeedPost";
import SkeletonLoader from "@/components/SkeletonLoader";
import EditPostModal from "./EditPostModal";

interface UserPostsProps {
  userId: string;
  selectedFilter: string;
  selectedSort: string;
}

interface Post {
  _id: string;
  content: string;
  images: string[];
  videos: string[];
  votes: number;
  comments: any[];
  category: string;
  user: string;
  commentCount: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  profilePhoto: string;
  isVerified: boolean;
  posts: Post[];
}

export default function UserPosts({
  userId,
  selectedFilter,
  selectedSort,
}: UserPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const userResponse = await axios.get(
          `${envConfig.baseApi}/auth/${userId}`,
          {
            headers: { Authorization: `${token}` },
          },
        );

        if (userResponse.data.success) {
          const userData = userResponse.data.data;
          setUserInfo(userData);
          setPosts(userData.posts);
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

  // Apply filters and sorting whenever posts, selectedFilter, or selectedSort changes
  useEffect(() => {
    const filtered = posts
      .filter((post) => {
        if (selectedFilter === "all") return true;
        if (selectedFilter === "premium") return post.isPaid;
        if (selectedFilter === "free") return !post.isPaid;
        return true;
      })
      .sort((a, b) => {
        switch (selectedSort) {
          case "oldest":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case "most-upvoted":
            return b.votes - a.votes;
          case "most-commented":
            return b.commentCount - a.commentCount;
          default: // latest
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
      });

    setFilteredPosts(filtered);
    setTotalPages(Math.ceil(filtered.length / postsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [posts, selectedFilter, selectedSort, postsPerPage]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
  };

  const handleUpdatePost = async (updatedPost: Post) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${envConfig.baseApi}/posts/${updatedPost._id}`,
        updatedPost,
        {
          headers: { Authorization: `${token}` },
        },
      );

      if (response.data.success) {
        toast.success("Post updated successfully");
        setEditingPost(null);
        setPosts(
          posts.map((post) =>
            post._id === updatedPost._id ? updatedPost : post,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `${envConfig.baseApi}/posts/${postId}`,
          {
            headers: { Authorization: `${token}` },
          },
        );

        if (response.data.success) {
          toast.success("Post deleted successfully");
          setPosts(posts.filter((post) => post._id !== postId));
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post");
      }
    }
  };

  if (loading || !userInfo) {
    return <SkeletonLoader />;
  }

  return (
    <div className="m-1 md:m-3">
      {currentPosts.length > 0 ? (
        currentPosts.map((post) => (
          <FeedPost
            key={post._id}
            post={{
              ...post,
              user: {
                _id: userInfo._id,
                profilePhoto: userInfo.profilePhoto,
                username: `@${userInfo.email.split("@")[0]}`,
                name: userInfo.name,
                isVerified: userInfo.isVerified,
                isFollowing: false,
              },
              timestamp: post.createdAt,
              comments: post.commentCount,
              category: post.category,
            }}
            onEdit={() => handleEditPost(post)}
            onDelete={() => handleDeletePost(post._id)}
            isProfilePage={true}
          />
        ))
      ) : (
        <p className="my-10 text-center text-gray-400">No posts available</p>
      )}

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onUpdate={(updatedPost) => {
            handleUpdatePost(updatedPost as Post).catch(console.error);
          }}
        />
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-ghost"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
