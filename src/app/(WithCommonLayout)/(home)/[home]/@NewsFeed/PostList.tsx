/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import SkeletonLoader from "@/components/SkeletonLoader";
import FeedPost from "./FeedPost";
import { jwtDecode } from "jwt-decode";

interface User {
  _id: string;
  name: string;
  profilePhoto: string;
  role: string;
  email: string;
  isVerified: boolean;
  isFollowing: boolean;
}

interface PostData {
  isPaid: boolean;
  category: {
    _id: string;
    name: string;
  };
  _id: string;
  user: User;
  content: string;
  images: string[];
  videos: string[];
  createdAt: string;
  votes: number;
  comments: { length: number };
  commentCount: number;
}

interface PostListProps {
  initialPosts: PostData[];
  sortBy: string;
  selectedCategory: string;
  selectedFilter: string;
  showInfiniteScroll: boolean;
}

export default function PostList({
  initialPosts,
  sortBy,
  selectedCategory,
  selectedFilter,
  showInfiniteScroll,
}: PostListProps) {
  const [visiblePosts, setVisiblePosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const postsPerPage = 10;
  const allPosts = useRef<PostData[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: { id: string } = jwtDecode(token);
      setCurrentUserId(decoded.id);
    }
  }, []);

  // Initialize filtered and sorted posts
  useEffect(() => {
    let filtered = initialPosts;

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (post) => post.category._id === selectedCategory,
      );
    }

    // Apply additional filters
    if (selectedFilter === "following") {
      filtered = filtered.filter((post) => post.user.isFollowing);
    } else if (selectedFilter === "premium") {
      filtered = filtered.filter((post) => post.isPaid);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "votes") {
        return b.votes - a.votes;
      } else if (sortBy === "latest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else if (sortBy === "most-commented") {
        return (
          (typeof b.comments === "number" ? b.comments : b.comments.length) -
          (typeof a.comments === "number" ? a.comments : a.comments.length)
        );
      }
      return 0;
    });

    allPosts.current = sorted;
    setVisiblePosts(sorted.slice(0, postsPerPage));
    setPage(1);
  }, [initialPosts, sortBy, selectedCategory, selectedFilter]);

  // Function to get next batch of posts
  const getMorePosts = useCallback(() => {
    if (loading) return;

    setLoading(true);
    const startIndex = page * postsPerPage;
    let newPosts: PostData[] = [];

    // If we've shown all posts, start over from the beginning
    if (startIndex >= allPosts.current.length) {
      newPosts = allPosts.current.slice(0, postsPerPage);
      setPage(1);
    } else {
      newPosts = allPosts.current.slice(startIndex, startIndex + postsPerPage);
      setPage((prev) => prev + 1);
    }

    setVisiblePosts((prev) => [...prev, ...newPosts]);
    setLoading(false);
  }, [page, loading]);

  // Intersection Observer setup
  useEffect(() => {
    const observerTarget = loaderRef.current; // Store ref value

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && showInfiniteScroll) {
          getMorePosts();
        }
      },
      {
        root: null,
        rootMargin: "20px",
        threshold: 0.1,
      },
    );

    if (observerTarget) {
      observer.observe(observerTarget);
    }

    return () => {
      if (observerTarget) {
        observer.unobserve(observerTarget);
      }
    };
  }, [getMorePosts, showInfiniteScroll]);

  return (
    <div>
      {visiblePosts.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-base-200 p-8 text-center">
          <div>
            <h3 className="mb-2 text-xl font-semibold">No posts found</h3>
            <p className="text-gray-500">
              Try adjusting your filters or check back later for new posts.
            </p>
          </div>
        </div>
      ) : (
        <>
          {visiblePosts.map((post) => (
            <FeedPost
              key={`${post._id}-${Math.random()}`}
              post={{
                ...post,
                user: {
                  name: post.user.name,
                  username: `@${post.user.email.split("@")[0]}`,
                  profilePhoto: post.user.profilePhoto,
                  isVerified: post.user.isVerified,
                  role: post.user.role,
                  isFollowing: false,
                  _id: post.user._id,
                },
                content: post.content,
                images: post.images,
                videos: post.videos,
                timestamp: post.createdAt,
                votes: post.votes,
                comments: post.comments.length || post.commentCount || 0,
                isPaid: post.isPaid,
                category: post.category.name,
              }}
            />
          ))}

          {/* Loader reference element */}
          <div ref={loaderRef} className="h-10 w-full">
            {loading && <SkeletonLoader />}
          </div>
        </>
      )}
    </div>
  );
}
