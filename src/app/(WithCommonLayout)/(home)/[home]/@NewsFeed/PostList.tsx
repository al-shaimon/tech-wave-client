"use client";

import { useState } from "react";
import axios from "axios";
import envConfig from "@/config/envConfig";
import SkeletonLoader from "@/components/SkeletonLoader";
import FeedPost from "./FeedPost";

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
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchNewPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${envConfig.baseApi}/posts`);
      if (response.data.success) {
        const newPosts = response.data.data;
        setPostsData((prevPosts) => {
          const existingPostIds = new Set(prevPosts.map((post) => post._id));
          const uniqueNewPosts = newPosts.filter(
            (post: PostData) => !existingPostIds.has(post._id),
          );
          return [...uniqueNewPosts, ...prevPosts];
        });
      }
      
    } catch (error) {
      console.error("Error fetching new posts:", error);
    } finally {
      setLoading(false);
    }
  };


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
    </div>
  );
}
