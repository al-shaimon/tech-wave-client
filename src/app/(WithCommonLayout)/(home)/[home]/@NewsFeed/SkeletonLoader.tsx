import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="mb-4 rounded-lg bg-base-100 py-4 shadow-md animate-pulse">
      <div className="flex items-start">
        {/* User Profile Picture Skeleton */}
        <div className="h-12 w-12 rounded-full bg-gray-300"></div>
        <div className="ml-2 w-full text-sm md:ml-4 md:text-base">
          {/* User Info Skeleton */}
          <div className="flex justify-between">
            <div className="flex flex-col">
              <div className="h-4 w-24 bg-gray-300 mb-1"></div>
              <div className="h-4 w-16 bg-gray-300"></div>
            </div>
            <div className="h-4 w-20 bg-gray-300"></div>
          </div>
          {/* Post Content Skeleton */}
          <div className="my-2 h-6 w-full bg-gray-300 md:h-8"></div>
          <div className="h-6 w-full bg-gray-300 md:h-8 mb-2"></div>
          {/* Optional: Placeholder for Images */}
          <div className="h-48 w-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
