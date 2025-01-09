/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import SkeletonLoader from "@/components/SkeletonLoader";
import FeedPost from "./FeedPost";

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
  showInfiniteScroll: boolean;
}

export default function PostList({
  initialPosts,
  sortBy,
  selectedCategory,
  showInfiniteScroll,
}: PostListProps) {
  const [visiblePosts, setVisiblePosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const postsPerPage = 10;
  const allPosts = useRef<PostData[]>([]);

  // Initialize filtered and sorted posts
  useEffect(() => {
    let filtered = initialPosts;

    if (selectedCategory !== "all") {
      filtered = initialPosts.filter(
        (post) => post.category._id === selectedCategory,
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "votes") {
        return b.votes - a.votes;
      } else if (sortBy === "latest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return 0;
    });

    allPosts.current = sorted;
    setVisiblePosts(sorted.slice(0, postsPerPage));
    setPage(1);
  }, [initialPosts, sortBy, selectedCategory]);

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
      {visiblePosts.map((post) => (
        <FeedPost
          key={`${post._id}-${Math.random()}`} // Ensure unique key when posts repeat
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
    </div>
  );
}
