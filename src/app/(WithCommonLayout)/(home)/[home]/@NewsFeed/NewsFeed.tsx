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
  sortBy: parentSortBy,
  selectedCategory: parentSelectedCategory,
  selectedFilter: parentSelectedFilter,
}: NewsFeedProps) {
  // Local state for mobile filters
  const [mobileSortBy, setMobileSortBy] = useState(parentSortBy);
  const [mobileSelectedCategory, setMobileSelectedCategory] = useState(
    parentSelectedCategory,
  );
  const [mobileSelectedFilter, setMobileSelectedFilter] =
    useState(parentSelectedFilter);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    [],
  );

  const {
    data: postsData,
    error: postsError,
    mutate,
  } = useSWR(`${envConfig.baseApi}/posts`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const { data: categoriesData } = useSWR(
    `${envConfig.baseApi}/post-categories`,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (categoriesData?.success) {
      setCategories(categoriesData.data);
    }
  }, [categoriesData]);

  useEffect(() => {
    setMobileSortBy(parentSortBy);
    setMobileSelectedCategory(parentSelectedCategory);
    setMobileSelectedFilter(parentSelectedFilter);
  }, [parentSortBy, parentSelectedCategory, parentSelectedFilter]);

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
    mobileSortBy === "latest" &&
    mobileSelectedCategory === "all" &&
    mobileSelectedFilter === "all";

  const filterOptions = [
    { id: "all", name: "All Posts" },
    { id: "following", name: "Following" },
    { id: "premium", name: "Premium" },
  ];

  return (
    <div className="flex-1 border-t border-[#26282a] p-1 md:p-4">
      {/* Mobile Filters */}
      <div className="mb-4 flex items-center gap-x-3 md:hidden">
        <div className="w-1/2">
          <select
            className="select select-bordered w-full"
            value={mobileSortBy}
            onChange={(e) => setMobileSortBy(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="most-upvoted">Most Upvoted</option>
            <option value="most-commented">Most Commented</option>
          </select>
        </div>
        <div className="w-1/2">
          <select
            className="select select-bordered w-full"
            value={mobileSelectedFilter}
            onChange={(e) => setMobileSelectedFilter(e.target.value)}
          >
            {filterOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-4 md:hidden">
        <select
          className="select select-bordered w-full"
          value={mobileSelectedCategory}
          onChange={(e) => setMobileSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <PostList
        initialPosts={postsData.data}
        sortBy={mobileSortBy}
        selectedCategory={mobileSelectedCategory}
        selectedFilter={mobileSelectedFilter}
        showInfiniteScroll={showInfiniteScroll}
      />
    </div>
  );
}
