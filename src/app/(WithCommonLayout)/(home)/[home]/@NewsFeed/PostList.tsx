/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import SkeletonLoader from "@/components/SkeletonLoader";
import FeedPost from "./FeedPost";
import InfiniteScroll from "react-infinite-scroll-component";

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
  const [postsData, setPostsData] = useState<PostData[]>(initialPosts);
  const [visiblePosts, setVisiblePosts] = useState<PostData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Shuffle posts for infinite scroll
  const shuffleArray = (array: PostData[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    setVisiblePosts([]);
    setHasMore(true);
    const filterAndSortPosts = () => {
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

      setVisiblePosts(sorted.slice(0, 50));
      setHasMore(sorted.length > 1);
    };

    filterAndSortPosts();
  }, [initialPosts, sortBy, selectedCategory]);

  const fetchMorePosts = () => {
    setLoading(true);

    const shuffledPosts = shuffleArray(postsData);

    setVisiblePosts((prevPosts) => [
      ...prevPosts,
      ...shuffledPosts.slice(0, 10),
    ]);

    setLoading(false);
  };

  return (
    <>
      {showInfiniteScroll ? (
        <InfiniteScroll
          dataLength={visiblePosts.length}
          next={fetchMorePosts}
          hasMore={hasMore}
          loader={<SkeletonLoader />}
          endMessage={
            <p className="my-10 flex items-center justify-center">
              No more posts available
            </p>
          }
        >
          {visiblePosts.map((post) => (
            <FeedPost
              key={post._id}
              post={{
                ...post,
                user: {
                  name: post.user.name,
                  username: `@${post.user.email.split("@")[0]}`,
                  profilePhoto: post.user.profilePhoto,
                  isVerified: post.user.isVerified,
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
        </InfiniteScroll>
      ) : (
        <div>
          {/* Display filtered posts if not using infinite scroll */}
          {visiblePosts.map((post) => (
            <FeedPost
              key={post._id}
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
        </div>
      )}
    </>
  );
}
