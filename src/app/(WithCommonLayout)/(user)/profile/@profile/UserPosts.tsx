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

export default function UserPosts({ userId }: UserPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserData | null>(null);
  const [sortBy, setSortBy] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [userResponse, categoriesResponse] = await Promise.all([
          axios.get(`${envConfig.baseApi}/auth/${userId}`, {
            headers: { Authorization: `${token}` },
          }),
          axios.get(`${envConfig.baseApi}/post-categories`),
        ]);

        if (userResponse.data.success) {
          const userData = userResponse.data.data;
          setUserInfo(userData);
          setPosts(userData.posts);
          setTotalPages(Math.ceil(userData.posts.length / postsPerPage));
        }

        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.data);
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

  const filteredAndSortedPosts = posts
    .filter((post) =>
      selectedCategory ? post.category === selectedCategory : true,
    )
    .sort((a, b) => {
      if (sortBy === "votes") {
        return b.votes - a.votes;
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredAndSortedPosts.slice(
    indexOfFirstPost,
    indexOfLastPost,
  );

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading || !userInfo) {
    return <SkeletonLoader />;
  }

  return (
    <div className="m-1 md:m-3">
      <div className="mb-4 flex items-center gap-x-3 md:flex-wrap">
        <div className="mb-2 mt-2 w-full sm:mb-0 sm:w-auto md:mt-0">
          <select
            className="select select-bordered w-full max-w-xs"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="votes">Most Upvoted</option>
          </select>
        </div>
        <div className="w-full sm:w-auto">
          <select
            className="select select-bordered w-full max-w-xs"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

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
              category:
                categories.find((c) => c._id === post.category)?.name ||
                "Unknown",
            }}
          />
        ))
      ) : (
        <p className="my-10 text-center text-gray-400">No posts available</p>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`mx-1 rounded px-3 py-1 ${
                currentPage === i + 1 ? "bg-primary text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
