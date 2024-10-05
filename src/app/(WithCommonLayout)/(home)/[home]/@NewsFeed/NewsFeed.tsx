/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import PostList from "./PostList";
import envConfig from "@/config/envConfig";
import SkeletonLoader from "@/components/SkeletonLoader";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NewsFeedPage() {
  const { data, error, mutate } = useSWR(
    `${envConfig.baseApi}/posts`,
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
    },
  );

  useEffect(() => {
    // Listen for new post events
    const eventSource = new EventSource(`${envConfig.baseApi}/posts/events`);
    eventSource.onmessage = (event) => {
      mutate(); // Revalidate the data when a new post is created
    };

    return () => {
      eventSource.close();
    };
  }, [mutate]);

  if (error) return <div>Failed to load posts</div>;
  if (!data)
    return (
      <div>
        <SkeletonLoader />
      </div>
    );

  return (
    <div className="my-2 border-t border-grey p-1 md:p-4">
      <PostList initialPosts={data.data} />
    </div>
  );
}
