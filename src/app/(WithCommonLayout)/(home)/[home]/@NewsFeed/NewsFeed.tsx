/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import PostList from "./PostList";
import envConfig from "@/config/envConfig";
import SkeletonLoader from "@/components/SkeletonLoader";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NewsFeedPage() {
  const [sortBy, setSortBy] = useState("latest"); // Default sort by "latest"
  const [selectedCategory, setSelectedCategory] = useState("all"); // Default to "all categories"
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    [],
  );

  const {
    data: postsData,
    error: postsError,
    mutate,
  } = useSWR(`${envConfig.baseApi}/posts`, fetcher, {
    refreshInterval: 60000, // Refresh every 60 seconds
  });

  const { data: categoriesData, error: categoriesError } = useSWR(
    `${envConfig.baseApi}/post-categories`,
    fetcher,
  );

  useEffect(() => {
    if (categoriesData && categoriesData.success) {
      setCategories(categoriesData.data);
    }
  }, [categoriesData]);

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

  if (postsError || categoriesError) return <div>Failed to load data</div>;
  if (!postsData || !categoriesData)
    return (
      <div>
        {/* <SkeletonLoader /> */}
      </div>
    );

  // Determine if we should show infinite scroll based on sorting and filtering
  const showInfiniteScroll = sortBy === "latest" && selectedCategory === "all";

  return (
    <div className="my-2 border-t border-grey p-1 md:p-4">
      <div className="mb-4 flex items-center gap-x-3 md:flex-wrap">
        <div className="mb-2 mt-2 w-full sm:mb-0 sm:w-auto md:mt-0">
          <select
            className="select select-bordered w-full max-w-xs"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="votes">Most Upvoted</option>
          </select>
        </div>
        <div className="w-full sm:w-auto">
          <select
            className="select select-bordered w-full max-w-xs"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conditionally render PostList with infinite scroll or filtered view */}
      <PostList
        initialPosts={postsData.data}
        sortBy={sortBy}
        selectedCategory={selectedCategory}
        showInfiniteScroll={showInfiniteScroll} // Pass flag to control scroll
      />
    </div>
  );
}
