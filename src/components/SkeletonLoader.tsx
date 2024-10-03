export default function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse space-x-4 border-b border-gray-200 p-4"
          >
            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 w-1/3 rounded bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 w-5/6 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
