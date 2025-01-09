/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import LeftSidebar from "./@profile/LeftSidebar";
import RightSidebar from "./@profile/RightSidebar";

const ProfileContent = dynamic(() => import("./ProfileContent"), {
  ssr: false,
});

export default function Profile() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("latest");

  return (
    <div className="container mx-auto">
      <div className="flex gap-4">
        {/* Left Sidebar */}
        <div className="sticky top-20 hidden h-[calc(100vh-5rem)] w-1/4 space-y-4 overflow-y-auto md:block">
          <LeftSidebar
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            selectedSort={selectedSort}
            setSelectedSort={setSelectedSort}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <ProfileContent
            selectedFilter={selectedFilter}
            selectedSort={selectedSort}
          />
        </div>

        {/* Right Sidebar */}
        <div className="sticky top-20 hidden h-[calc(100vh-5rem)] w-1/4 overflow-y-auto lg:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
