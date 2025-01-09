"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import { format } from "date-fns";
import SkeletonLoader from "@/components/SkeletonLoader";

interface ActivityLog {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  timestamp: string;
}

export default function ActivityLogsComponent() {
  const [allActivityLogs, setAllActivityLogs] = useState<ActivityLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const logsPerPage = 10;

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${envConfig.baseApi}/activity-logs`, {
        headers: { Authorization: `${token}` },
      });
      setAllActivityLogs(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error("Failed to load activity logs.");
      setLoading(false);
    }
  };

  // Get current logs
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = allActivityLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(allActivityLogs.length / logsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show max 5 page numbers at a time

    if (totalPages <= maxPagesToShow) {
      // If total pages are less than max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of page numbers to show
      let start = Math.max(currentPage - 1, 2);
      let end = Math.min(currentPage + 1, totalPages - 1);

      // Adjust if we're near the start or end
      if (currentPage <= 2) {
        end = 4;
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      // Add dots if there's a gap after 1
      if (start > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add dots if there's a gap before last page
      if (end < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (loading) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {currentLogs.map((log) => (
            <tr key={log?._id}>
              <td>{log.user?.name}</td>
              <td>{log.user?.email}</td>
              <td>{log.user?.role}</td>
              <td>{log?.action}</td>
              <td>{format(new Date(log.timestamp), "PPpp")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center px-4 md:mt-4 md:justify-between">
          <div className="hidden text-sm text-gray-500 md:block">
            Showing {indexOfFirstLog + 1} to{" "}
            {Math.min(indexOfLastLog, allActivityLogs.length)} of{" "}
            {allActivityLogs.length} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-sm"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {getPageNumbers().map((page, index) =>
                typeof page === "number" ? (
                  <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    className={`btn btn-sm ${
                      currentPage === page ? "text-white bg-primary" : "btn-ghost"
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="flex items-center px-2">
                    {page}
                  </span>
                ),
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
