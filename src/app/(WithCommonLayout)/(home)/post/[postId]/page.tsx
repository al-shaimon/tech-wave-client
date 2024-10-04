"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import FeedPost from "../../[home]/@NewsFeed/FeedPost";
import CommentSection from "./CommentSection";
import SkeletonLoader from "@/components/SkeletonLoader";

export default function SinglePostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    try {
      const [postResponse, commentsResponse] = await Promise.all([
        axios.get(`${envConfig.baseApi}/posts/${postId}`),
        axios.get(`${envConfig.baseApi}/comments/post/${postId}`)
      ]);
      if (postResponse.data.success && commentsResponse.data.success) {
        const postData = {
          ...postResponse.data.data,
          timestamp: postResponse.data.data.createdAt,
          comments: commentsResponse.data.data
        };
        setPost(postData);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load post.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleCommentUpdate = () => {
    fetchPost(); // Refetch the post data when a comment is added or deleted
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FeedPost post={post} />
      <CommentSection 
        postId={Array.isArray(postId) ? postId[0] : postId} 
        onCommentUpdate={handleCommentUpdate}
      />
    </div>
  );
}