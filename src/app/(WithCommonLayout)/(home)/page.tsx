"use client";

import React from "react";
import Post from "./[home]/@Post/page";
import NewsFeed from "./[home]/@NewsFeed/NewsFeed";
import RightSidebar from "./[home]/RightSidebar";
import LeftSidebar from "./[home]/LeftSidebar";
import { useState } from "react";
import useSWR from "swr";
import envConfig from "@/config/envConfig";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [sortBy, setSortBy] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { data: categoriesData } = useSWR(
    `${envConfig.baseApi}/post-categories`,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  return (
    <div className="container mx-auto flex gap-4">
      {/* Left Sidebar */}
      <div className="sticky top-20 hidden h-[calc(100vh-5rem)] w-1/4 space-y-4 overflow-y-auto md:block">
        <div className="rounded-lg bg-base-200 p-4">
          <h2 className="mb-4 text-xl font-bold">Welcome to TechWave</h2>
          <p className="text-gray-400">
            Share your thoughts, experiences, and insights with the tech
            community.
          </p>
        </div>

        <LeftSidebar
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          selectedSort={sortBy}
          setSelectedSort={setSortBy}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categoriesData?.data || []}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Post />
        <NewsFeed
          sortBy={sortBy}
          selectedCategory={selectedCategory}
          selectedFilter={selectedFilter}
        />
      </div>

      {/* Right Sidebar */}
      <div className="sticky top-20 hidden h-[calc(100vh-5rem)] w-1/4 overflow-y-auto lg:block">
        <RightSidebar />
      </div>
    </div>
  );
}
