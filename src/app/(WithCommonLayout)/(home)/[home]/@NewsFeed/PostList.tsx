/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
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
  category: string;
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
}

export default function PostList({ initialPosts }: PostListProps) {
  const [postsData, setPostsData] = useState<PostData[]>(initialPosts);
  const [visiblePosts, setVisiblePosts] = useState<PostData[]>(
    initialPosts.slice(0, 50),
  ); // First 10 posts visible initially
  const [hasMore, setHasMore] = useState(true); // Infinite scroll flag
  const [loading, setLoading] = useState(false); // Loading state

  // Function to shuffle the posts array
  const shuffleArray = (array: PostData[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

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
      {/* Render the visible posts */}
      {visiblePosts.length > 0 ? (
        visiblePosts.map((post) => (
          <FeedPost
            key={post._id}
            post={{
              _id: post._id,
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
              category: post.category,
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
