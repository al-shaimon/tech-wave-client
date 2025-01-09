/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import PostList from "./PostList";
import envConfig from "@/config/envConfig";
import SkeletonLoader from "@/components/SkeletonLoader";

interface NewsFeedProps {
  sortBy: string;
  selectedCategory: string;
  selectedFilter: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NewsFeedPage({
  sortBy,
  selectedCategory,
  selectedFilter,
}: NewsFeedProps) {
  const {
    data: postsData,
    error: postsError,
    mutate,
  } = useSWR(`${envConfig.baseApi}/posts`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  useEffect(() => {
    if (!postsData?.data) return;

    const eventSource = new EventSource(`${envConfig.baseApi}/posts/events`);

    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      if (eventData.type === "post_updated") {
        mutate();
      }
    };

    return () => {
      eventSource.close();
    };
  }, [mutate, postsData]);

  if (postsError) return <div>Failed to load data</div>;
  if (!postsData) return <SkeletonLoader />;

  // Determine if we should show infinite scroll based on sorting and filtering
  const showInfiniteScroll =
    sortBy === "latest" &&
    selectedCategory === "all" &&
    selectedFilter === "all";

  return (
    <div className="flex-1 border-t border-[#26282a] p-1 md:p-4">
      <PostList
        initialPosts={postsData.data}
        sortBy={sortBy}
        selectedCategory={selectedCategory}
        selectedFilter={selectedFilter}
        showInfiniteScroll={showInfiniteScroll}
      />
    </div>
  );
}
