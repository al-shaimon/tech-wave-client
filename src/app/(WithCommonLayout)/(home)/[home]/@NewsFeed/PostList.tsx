"use client";

import { useState, useEffect } from "react";

import SkeletonLoader from "@/components/SkeletonLoader";
import FeedPost from "./FeedPost";

interface User {
  name: string;
  profilePhoto: string;
  email: string;
}

interface PostData {
  _id: string;
  user: User;
  content: string;
  images: string[];
  videos: string[];
  createdAt: string;
  votes: number;
  comments: { length: number };
}

interface PostListProps {
  initialPosts: PostData[];
}

export default function PostList({ initialPosts }: PostListProps) {
  const [postsData] = useState<PostData[]>(initialPosts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div>
      {/* Show skeleton loader while loading */}
      {loading && <SkeletonLoader />}

      {/* Render the fetched posts */}
      {postsData.length > 0 ? (
        postsData.map((post) => (
          <FeedPost
            key={post._id}
            post={{
              user: {
                name: post.user.name,
                username: `@${post.user.email.split("@")[0]}`,
                profilePic: post.user.profilePhoto,
              },
              content: post.content,
              images: post.images,
              videos: post.videos,
              timestamp: post.createdAt,
              votes: post.votes,
              comments: post.comments.length,
            }}
          />
        ))
      ) : (
        <p className="my-10 flex items-center justify-center">
          No posts available
        </p>
      )}
    </div>
  );
}
