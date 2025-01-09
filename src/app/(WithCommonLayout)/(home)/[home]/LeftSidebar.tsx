"use client";

import React from "react";
import Image from "next/image";

interface FilterOption {
  id: string;
  name: string;
  icon: string;
}

interface LeftSidebarProps {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: { _id: string; name: string }[];
}

const filterOptions: FilterOption[] = [
  { id: "all", name: "All Posts", icon: "/feed.svg" },
  { id: "following", name: "Following", icon: "/following.svg" },
  { id: "premium", name: "Premium", icon: "/premium.svg" },
];

export default function LeftSidebar({
  selectedFilter,
  setSelectedFilter,
  selectedSort,
  setSelectedSort,
  selectedCategory,
  setSelectedCategory,
  categories,
}: LeftSidebarProps) {
  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSort(event.target.value);
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedCategory(event.target.value);
  };

  const handleClearFilters = () => {
    setSelectedFilter("all");
    setSelectedSort("latest");
    setSelectedCategory("all");
  };

  const isDefaultFilters =
    selectedFilter === "all" &&
    selectedSort === "latest" &&
    selectedCategory === "all";

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
              selectedFilter === option.id ? "bg-base-300" : ""
            }`}
          >
            <Image
              src={option.icon}
              alt={option.name}
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span>{option.name}</span>
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="mt-6">
        <h3 className="mb-2 font-semibold">Sort By</h3>
        <select
          value={selectedSort}
          onChange={handleSortChange}
          className="select select-bordered w-full"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="most-upvoted">Most Upvoted</option>
          <option value="most-commented">Most Commented</option>
        </select>
      </div>

      {/* Categories */}
      <div className="mt-6">
        <h3 className="mb-2 font-semibold">Categories</h3>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="select select-bordered w-full"
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
  );
}
