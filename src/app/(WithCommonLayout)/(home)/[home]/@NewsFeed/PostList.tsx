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
}

export default function PostList({ initialPosts, sortBy, selectedCategory }: PostListProps) {
  const [visiblePosts, setVisiblePosts] = useState<PostData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const filteredPosts = initialPosts.filter((post) =>
      selectedCategory ? post.category._id === selectedCategory : true
    );

    const sortedPosts = [...filteredPosts].sort((a, b) => {
      if (sortBy === "votes") {
        return b.votes - a.votes;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setVisiblePosts(sortedPosts.slice(0, 10));
    setHasMore(sortedPosts.length > 10);
  }, [initialPosts, sortBy, selectedCategory]);

  const fetchMorePosts = () => {
    setLoading(true);

    const filteredPosts = initialPosts.filter((post) =>
      selectedCategory ? post.category._id === selectedCategory : true
    );

    const sortedPosts = [...filteredPosts].sort((a, b) => {
      if (sortBy === "votes") {
        return b.votes - a.votes;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    const nextPosts = sortedPosts.slice(visiblePosts.length, visiblePosts.length + 10);

    setVisiblePosts((prevPosts) => [...prevPosts, ...nextPosts]);
    setHasMore(visiblePosts.length + nextPosts.length < sortedPosts.length);
    setLoading(false);
  };

  return (
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
      {visiblePosts.length > 0 ? (
        visiblePosts.map((post) => (
          <FeedPost
            key={post._id}
            post={{
              ...post,
              user: {
                name: post?.user?.name,
                username: `@${post?.user?.email?.split("@")[0]}`,
                profilePhoto: post?.user?.profilePhoto,
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
        ))
      ) : (
        <p className="my-10 flex items-center justify-center">
          No posts available
        </p>
      )}
    </InfiniteScroll>
  );
}