"use client";

import React from "react";
import Image from "next/image";

interface LeftSidebarProps {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
}

export default function LeftSidebar({
  selectedFilter,
  setSelectedFilter,
  selectedSort,
  setSelectedSort,
}: LeftSidebarProps) {
  const filterOptions = [
    { id: "all", name: "All Posts", icon: "/feed.svg" },
    { id: "premium", name: "Premium Posts", icon: "/premium.svg" },
    { id: "free", name: "Free Posts", icon: "/posts.svg" },
  ];

  const sortOptions = [
    { id: "latest", name: "Latest" },
    { id: "oldest", name: "Oldest" },
    { id: "most-upvoted", name: "Most Upvoted" },
    { id: "most-commented", name: "Most Commented" },
  ];

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
  };

  const handleSortChange = (sortId: string) => {
    setSelectedSort(sortId);
  };

  const handleClearFilters = () => {
    setSelectedFilter("all");
    setSelectedSort("latest");
  };

  const isDefaultFilters =
    selectedFilter === "all" && selectedSort === "latest";

  return (
    <div className="rounded-lg bg-base-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Filters</h2>
        {!isDefaultFilters && (
          <button
            onClick={handleClearFilters}
            className="btn btn-ghost btn-sm gap-1 text-primary"
          >
            <Image
              src="/clear-filter.svg"
              alt="Clear filters"
              width={20}
              height={20}
            />
            Clear Filters
          </button>
        )}
      </div>

      {/* Filter Options */}
      <div className="space-y-2">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleFilterChange(option.id)}
            className={`flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-base-300 ${
              selectedFilter === option.id ? "bg-primary text-white" : ""
            }`}
          >
            <Image
              src={option.icon}
              alt={option.name}
              width={24}
              height={24}
              className={`h-6 w-6 ${selectedFilter === option.id ? "brightness-0 invert" : ""}`}
            />
            <span>{option.name}</span>
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="mt-6">
        <h3 className="mb-2 font-semibold">Sort By</h3>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSortChange(option.id)}
              className={`w-full rounded-lg px-4 py-2 text-left transition-colors ${
                selectedSort === option.id
                  ? "bg-primary text-white"
                  : "hover:bg-base-300"
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
