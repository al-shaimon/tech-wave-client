"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import Image from "next/image";
import SkeletonLoader from "@/components/SkeletonLoader";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  profilePhoto: string;
  isBlocked: boolean;
}

export default function ManageUsersComponent() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${envConfig.baseApi}/auth/users`, {
        headers: { Authorization: `${token}` },
      });
      setAllUsers(response.data.data.users);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setLoading(false);
    }
  };

  const handleBlockUser = async (
    userId: string,
    isCurrentlyBlocked: boolean,
  ) => {
    try {
      const token = localStorage.getItem("token");
      const action = isCurrentlyBlocked ? "unblock" : "block";
      await axios.post(
        `${envConfig.baseApi}/auth/${action}/${userId}`,
        {},
        {
          headers: { Authorization: `${token}` },
        },
      );

      // Update local state
      setAllUsers((users) =>
        users.map((user) =>
          user._id === userId
            ? { ...user, isBlocked: !isCurrentlyBlocked }
            : user,
        ),
      );

      toast.success(`User ${action}ed successfully`);
    } catch (error) {
      console.error(
        `Error ${isCurrentlyBlocked ? "unblocking" : "blocking"} user:`,
        error,
      );
      toast.error("Operation failed");
    }
  };

  // Get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = allUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(allUsers.length / usersPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      let start = Math.max(currentPage - 1, 2);
      let end = Math.min(currentPage + 1, totalPages - 1);

      if (currentPage <= 2) {
        end = 4;
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pageNumbers.push("...");
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < totalPages - 1) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user._id}>
              <td>
                <div className="flex items-center gap-3">
                  <Image
                    src={user.profilePhoto || "/default-avatar.png"}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-bold">{user.name}</div>
                    {user.isVerified && (
                      <div className="text-sm text-primary">Premium User</div>
                    )}
                  </div>
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                <span
                  className={`badge ${user.role === "admin" ? "badge-primary" : "badge-ghost"}`}
                >
                  {user.role}
                </span>
              </td>
              <td>
                <span
                  className={`badge ${user.isBlocked ? "badge-error" : "badge-success"}`}
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </td>
              <td>
                {user.role !== "admin" && (
                  <button
                    onClick={() => handleBlockUser(user._id, user.isBlocked)}
                    className={`btn btn-sm ${user.isBlocked ? "btn-success" : "btn-error"}`}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center px-4 md:mt-4 md:justify-between">
          <div className="hidden text-sm text-gray-500 md:block">
            Showing {indexOfFirstUser + 1} to{" "}
            {Math.min(indexOfLastUser, allUsers.length)} of {allUsers.length}{" "}
            users
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
                      currentPage === page
                        ? "bg-primary text-white"
                        : "btn-ghost"
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
